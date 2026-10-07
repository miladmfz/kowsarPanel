import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const buildRoot = resolve(process.argv[2] ?? 'dist/.bundle-audit/browser');
const previewPort = Number(process.env.KOWSAR_UI_PREVIEW_PORT ?? 41737);
const debuggingPort = Number(process.env.KOWSAR_UI_DEBUG_PORT ?? 41738);
const previewUrl = `http://127.0.0.1:${previewPort}/`;
const reportPath = resolve('dist/ui-acceptance-report.json');
const profilePath = resolve('dist/.ui-acceptance-profile');

const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
].filter(Boolean);
const chromePath = chromeCandidates.find(candidate => existsSync(candidate));

if (!existsSync(join(buildRoot, 'index.html'))) throw new Error(`Built application not found: ${buildRoot}`);
if (!chromePath) throw new Error('Google Chrome was not found. Set CHROME_PATH to run the UI acceptance gate.');

const delay = milliseconds => new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));

async function stopProcess(childProcess) {
  if (!childProcess || childProcess.exitCode !== null) return;
  const exited = new Promise(resolveExit => childProcess.once('exit', resolveExit));
  childProcess.kill();
  await Promise.race([exited, delay(5000)]);
}

async function waitFor(check, description, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ''}`);
}

function connectCdp(url) {
  return new Promise((resolveConnection, rejectConnection) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    let nextId = 0;

    socket.onopen = () => {
      resolveConnection({
        close: () => socket.close(),
        command(method, params = {}, sessionId) {
          const id = ++nextId;
          return new Promise((resolveCommand, rejectCommand) => {
            const timer = setTimeout(() => {
              pending.delete(id);
              rejectCommand(new Error(`CDP command timed out: ${method}`));
            }, 10_000);
            pending.set(id, { resolveCommand, rejectCommand, timer });
            socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
          });
        },
      });
    };
    socket.onerror = () => rejectConnection(new Error('Could not connect to Chrome DevTools Protocol.'));
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const pendingCommand = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(pendingCommand.timer);
      if (message.error) pendingCommand.rejectCommand(new Error(message.error.message));
      else pendingCommand.resolveCommand(message.result);
    };
  });
}

async function evaluate(cdp, sessionId, expression) {
  const result = await cdp.command('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  }, sessionId);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'Browser evaluation failed.');
  return result.result.value;
}

async function inspectViewport(cdp, sessionId, scenario) {
  await cdp.command('Emulation.setDeviceMetricsOverride', {
    width: scenario.width,
    height: scenario.height,
    deviceScaleFactor: 1,
    mobile: scenario.mobile,
  }, sessionId);
  await cdp.command('Page.navigate', { url: previewUrl }, sessionId);
  await waitFor(async () => evaluate(cdp, sessionId, `document.readyState === 'complete'`), `${scenario.name} document`);
  await evaluate(cdp, sessionId, `localStorage.setItem('theme', ${JSON.stringify(scenario.theme)}); true`);
  await cdp.command('Page.reload', { ignoreCache: true }, sessionId);
  await waitFor(async () => evaluate(
    cdp,
    sessionId,
    `document.readyState === 'complete'
      && document.documentElement.getAttribute('data-bs-theme') === ${JSON.stringify(scenario.theme)}
      && !!document.querySelector('form')
      && !!document.querySelector('.kws-password-eye')`,
  ), `${scenario.name} Angular login page`);
  await delay(250);

  const layout = await evaluate(cdp, sessionId, `(() => {
    const root = document.documentElement;
    const body = document.body;
    const passwordButton = document.querySelector('.kws-password-eye');
    const loginCard = document.querySelector('.kws-login-card');
    const loginTitle = document.querySelector('.kws-login-title');
    const loginSubtitle = document.querySelector('.kws-login-subtitle');
    const loginInput = document.querySelector('.kws-input');
    const parseRgb = value => {
      const match = value?.match(/rgba?\\(\\s*([\\d.]+)[, ]+([\\d.]+)[, ]+([\\d.]+)(?:[, /]+([\\d.]+))?\\)/i);
      return match ? { rgb: match.slice(1, 4).map(Number), alpha: match[4] === undefined ? 1 : Number(match[4]) } : undefined;
    };
    const composite = (foreground, background) => foreground.rgb.map((channel, index) =>
      channel * foreground.alpha + background[index] * (1 - foreground.alpha));
    const luminance = rgb => rgb.map(channel => {
      const value = channel / 255;
      return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
    const contrast = (foregroundValue, backgroundValue) => {
      const foreground = parseRgb(foregroundValue);
      const background = parseRgb(backgroundValue);
      if (!foreground || !background) return 0;
      const backgroundRgb = composite(background, [255, 255, 255]);
      const foregroundRgb = composite(foreground, backgroundRgb);
      const values = [luminance(foregroundRgb), luminance(backgroundRgb)];
      return Number(((Math.max(...values) + .05) / (Math.min(...values) + .05)).toFixed(2));
    };
    const cardStyle = getComputedStyle(loginCard);
    const titleStyle = getComputedStyle(loginTitle);
    const subtitleStyle = getComputedStyle(loginSubtitle);
    const inputStyle = getComputedStyle(loginInput);
    const cardBackground = cardStyle.backgroundColor;
    const inputBackground = inputStyle.backgroundColor;
    const cardGradientColor = cardStyle.backgroundImage.match(/rgba?\\([^)]*\\)/i)?.[0];
    const cardSurface = parseRgb(cardBackground)?.alpha > 0 ? cardBackground : (cardGradientColor ?? cardBackground);
    const cardColor = parseRgb(cardSurface);
    const inputColor = parseRgb(inputBackground);
    const bsLight = document.getElementById('bs-default-stylesheet');
    const appLight = document.getElementById('app-default-stylesheet');
    const bsDark = document.getElementById('bs-dark-stylesheet');
    const appDark = document.getElementById('app-dark-stylesheet');
    const overflowingElements = [...document.querySelectorAll('*')]
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
      })
      .slice(0, 8)
      .map(element => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className : '',
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }));
    return {
      route: location.pathname,
      appliedTheme: root.getAttribute('data-bs-theme'),
      colorScheme: getComputedStyle(root).colorScheme,
      themeAssetsCorrect: ${JSON.stringify(scenario.theme)} === 'dark'
        ? bsLight.disabled && appLight.disabled && !bsDark.disabled && !appDark.disabled
        : !bsLight.disabled && !appLight.disabled && bsDark.disabled && appDark.disabled,
      cardBackground,
      cardBackgroundImage: cardStyle.backgroundImage,
      inputBackground,
      inputBackgroundImage: inputStyle.backgroundImage,
      titleColor: titleStyle.color,
      subtitleColor: subtitleStyle.color,
      inputColor: inputStyle.color,
      inputAutofilled: loginInput.matches(':-webkit-autofill'),
      cardLuminance: cardColor ? Number(luminance(composite(cardColor, [255, 255, 255])).toFixed(3)) : -1,
      inputLuminance: inputColor ? Number(luminance(composite(inputColor, [255, 255, 255])).toFixed(3)) : -1,
      titleContrast: contrast(titleStyle.color, cardSurface),
      subtitleContrast: contrast(subtitleStyle.color, cardSurface),
      inputContrast: contrast(inputStyle.color, inputBackground),
      viewportWidth: window.innerWidth,
      documentWidth: Math.max(root.scrollWidth, body.scrollWidth),
      horizontalOverflow: Math.max(root.scrollWidth, body.scrollWidth) > window.innerWidth + 1,
      overflowingElements,
      rtl: root.dir === 'rtl' && getComputedStyle(body).direction === 'rtl',
      semanticHeading: !!document.querySelector('h1'),
      formPresent: !!document.querySelector('form'),
      passwordControl: passwordButton?.tagName === 'BUTTON'
        && passwordButton.tabIndex >= 0
        && !!passwordButton.getAttribute('aria-label')
        && passwordButton.hasAttribute('aria-pressed'),
    };
  })()`);

  const beforeKeyboard = await evaluate(cdp, sessionId, `(() => {
    const button = document.querySelector('.kws-password-eye');
    const input = document.querySelector('.kws-password-wrapper input');
    button.focus();
    return { pressed: button.getAttribute('aria-pressed'), type: input?.type, focused: document.activeElement === button };
  })()`);
  await cdp.command('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 }, sessionId);
  await cdp.command('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 }, sessionId);
  await delay(100);
  const afterKeyboard = await evaluate(cdp, sessionId, `(() => {
    const button = document.querySelector('.kws-password-eye');
    const input = document.querySelector('.kws-password-wrapper input');
    return { pressed: button.getAttribute('aria-pressed'), type: input?.type };
  })()`);

  return {
    ...scenario,
    ...layout,
    keyboardBefore: beforeKeyboard,
    keyboardAfter: afterKeyboard,
    keyboardPasswordToggle: beforeKeyboard.focused
      && beforeKeyboard.pressed !== afterKeyboard.pressed
      && beforeKeyboard.type !== afterKeyboard.type,
  };
}

let previewProcess;
let chromeProcess;
let cdp;

try {
  rmSync(profilePath, { recursive: true, force: true });
  mkdirSync(profilePath, { recursive: true });

  previewProcess = spawn(process.execPath, ['scripts/serve-built-app.mjs', buildRoot, String(previewPort)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let previewExit;
  previewProcess.once('exit', code => { previewExit = code; });
  await waitFor(async () => {
    if (previewExit !== undefined) throw new Error(`preview server exited with code ${previewExit}`);
    const response = await fetch(previewUrl);
    return response.ok;
  }, 'preview server');

  chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${profilePath}`,
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  let chromeExit;
  chromeProcess.once('exit', code => { chromeExit = code; });

  const version = await waitFor(async () => {
    if (chromeExit !== undefined) throw new Error(`Chrome exited with code ${chromeExit}`);
    const response = await fetch(`http://127.0.0.1:${debuggingPort}/json/version`);
    return response.ok ? response.json() : undefined;
  }, 'headless Chrome');
  cdp = await connectCdp(version.webSocketDebuggerUrl);

  const { targetInfos } = await cdp.command('Target.getTargets');
  const pageTarget = targetInfos.find(target => target.type === 'page');
  if (!pageTarget) throw new Error('Chrome page target was not created.');
  const { sessionId } = await cdp.command('Target.attachToTarget', { targetId: pageTarget.targetId, flatten: true });
  await cdp.command('Page.enable', {}, sessionId);
  await cdp.command('Runtime.enable', {}, sessionId);

  const viewports = [
    { viewport: 'desktop', width: 1440, height: 900, mobile: false },
    { viewport: 'mobile', width: 390, height: 844, mobile: true },
  ];
  const scenarios = viewports.flatMap(viewport => ['light', 'dark'].map(theme => ({
    ...viewport,
    theme,
    name: `${viewport.viewport}-${theme}`,
  })));
  const results = [];
  for (const scenario of scenarios) results.push(await inspectViewport(cdp, sessionId, scenario));

  const failures = results.flatMap(result => [
    result.horizontalOverflow && `${result.name}: horizontal overflow (${result.documentWidth}px > ${result.viewportWidth}px)`,
    !result.rtl && `${result.name}: RTL document contract is missing`,
    !result.semanticHeading && `${result.name}: semantic h1 is missing`,
    !result.formPresent && `${result.name}: login form is missing`,
    !result.passwordControl && `${result.name}: accessible password button contract is missing`,
    !result.keyboardPasswordToggle && `${result.name}: password button cannot be activated with Space`,
    result.appliedTheme !== result.theme && `${result.name}: requested theme was not applied`,
    !result.themeAssetsCorrect && `${result.name}: light/dark stylesheet activation is incorrect`,
    !result.colorScheme.split(/\\s+/).includes(result.theme) && `${result.name}: CSS color-scheme does not include ${result.theme}`,
    result.titleContrast < 4.5 && `${result.name}: login title contrast is ${result.titleContrast}:1`,
    result.subtitleContrast < 4.5 && `${result.name}: login subtitle contrast is ${result.subtitleContrast}:1`,
    result.inputContrast < 4.5 && `${result.name}: login input contrast is ${result.inputContrast}:1`,
    result.theme === 'dark' && result.cardLuminance > .35 && `${result.name}: login card is still a light surface (${result.cardLuminance})`,
    result.theme === 'dark' && result.inputLuminance > .35 && `${result.name}: login input is still a light surface (${result.inputLuminance})`,
    result.theme === 'light' && result.cardLuminance < .65 && `${result.name}: login card is unexpectedly dark (${result.cardLuminance})`,
  ].filter(Boolean));

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), results, failures }, null, 2)}\n`);

  for (const result of results) {
    console.log(`${result.name}: ${result.viewportWidth}x${result.height}, document ${result.documentWidth}px, RTL ${result.rtl ? 'PASS' : 'FAIL'}, theme ${result.themeAssetsCorrect ? 'PASS' : 'FAIL'}, contrast ${Math.min(result.titleContrast, result.subtitleContrast, result.inputContrast)}:1, keyboard ${result.keyboardPasswordToggle ? 'PASS' : 'FAIL'}`);
    if (result.horizontalOverflow && result.overflowingElements.length) console.log(`  overflowing elements: ${JSON.stringify(result.overflowingElements)}`);
  }
  if (failures.length) throw new Error(`UI acceptance failed:\n- ${failures.join('\n- ')}`);
  console.log(`UI acceptance passed (${results.length}/${results.length} viewports).`);
} finally {
  if (cdp) {
    try { await cdp.command('Browser.close'); } catch {}
    cdp.close();
  }
  await stopProcess(chromeProcess);
  await stopProcess(previewProcess);
  rmSync(profilePath, {
    recursive: true,
    force: true,
    maxRetries: 20,
    retryDelay: 250,
  });
}
