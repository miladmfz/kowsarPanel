import process from 'node:process';

const options = parseArguments(process.argv.slice(2));
if (!options.backend && !options.frontend) {
  console.error(
    'Usage: node scripts/post-deploy-smoke.mjs --backend <base-url> [--frontend <base-url>] [--allow-unready]',
  );
  process.exit(2);
}

const failures = [];
const results = [];

if (options.frontend) {
  await check('frontend shell', new URL('./', ensureTrailingSlash(options.frontend)), {
    expectedStatus: 200,
    contains: '<app-root',
  });
  await check('frontend runtime config', new URL('assets/config.json', ensureTrailingSlash(options.frontend)), {
    expectedStatus: 200,
    contentType: 'application/json',
  });
  await check('frontend release metadata', new URL('release.json', ensureTrailingSlash(options.frontend)), {
    expectedStatus: 200,
    contentType: 'application/json',
  });
}

if (options.backend) {
  const backend = ensureTrailingSlash(options.backend);
  await check('backend liveness', new URL('health/live', backend), { expectedStatus: 200 });
  await check('backend readiness', new URL('health/ready', backend), {
    expectedStatus: options.allowUnready ? [200, 503] : 200,
  });
  await check('backend dependencies', new URL('health/dependencies', backend), {
    expectedStatus: options.allowUnready ? [200, 503] : 200,
    contentType: 'application/json',
  });
  await check('protected session', new URL('api/Auth/v2/session', backend), {
    expectedStatus: 401,
  });
  await check('incomplete login contract', new URL('api/Auth/KowsarLogin', backend), {
    expectedStatus: 400,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    },
  });
  await check('protected browser monitoring', new URL('api/Kits/ErrorLog', backend), {
    expectedStatus: 401,
    init: {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ErrorLog: 'sanitized smoke error',
        Broker: 'KowsarPanel',
        DeviceId: 'browser',
        ServerName: 'smoke',
        VersionName: 'smoke',
        StrDate: new Date().toISOString(),
      }),
    },
  });
  await check(
    'anonymous SignalR negotiate',
    new URL('hubs/autletter/negotiate?negotiateVersion=1', backend),
    {
      expectedStatus: 401,
      init: { method: 'POST' },
    },
  );
}

for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.name}: HTTP ${result.status}`);
}

if (failures.length > 0) {
  console.error(`Post-deploy smoke failed (${failures.length}/${results.length}).`);
  process.exit(1);
}

console.log(`Post-deploy smoke passed (${results.length}/${results.length}).`);

async function check(name, url, expectation) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      ...expectation.init,
    });
    const body = await response.text();
    const statuses = Array.isArray(expectation.expectedStatus)
      ? expectation.expectedStatus
      : [expectation.expectedStatus];
    const contentType = response.headers.get('content-type') ?? '';
    const ok = statuses.includes(response.status)
      && (!expectation.contains || body.includes(expectation.contains))
      && (!expectation.contentType || contentType.includes(expectation.contentType));
    results.push({ name, status: response.status, ok });
    if (!ok) failures.push(name);
  } catch (error) {
    results.push({ name, status: `request error (${error.name})`, ok: false });
    failures.push(name);
  }
}

function ensureTrailingSlash(value) {
  const url = new URL(value);
  if (url.username || url.password) {
    throw new Error('Smoke-test URLs must not contain credentials.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Smoke-test URLs must use HTTP or HTTPS.');
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}

function parseArguments(args) {
  const parsed = { backend: '', frontend: '', allowUnready: false };
  const positionalUrls = [];
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--allow-unready' || argument === 'allow-unready') {
      parsed.allowUnready = true;
    } else if (argument === '--backend' || argument === '--frontend') {
      const value = args[index + 1];
      if (!value) throw new Error(`${argument} requires a URL.`);
      parsed[argument.slice(2)] = value;
      index += 1;
    } else if (/^https?:\/\//i.test(argument)) {
      positionalUrls.push(argument);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  // npm can consume option names while forwarding their values on Windows.
  // One positional URL is the backend; two are frontend then backend.
  if (!parsed.backend && !parsed.frontend && positionalUrls.length === 1) {
    parsed.backend = positionalUrls[0];
  } else if (!parsed.backend && !parsed.frontend && positionalUrls.length === 2) {
    [parsed.frontend, parsed.backend] = positionalUrls;
  } else if (positionalUrls.length > 0) {
    throw new Error('Do not mix named and positional smoke-test URLs.');
  }
  return parsed;
}
