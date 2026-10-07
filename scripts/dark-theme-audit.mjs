import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import postcss from 'postcss';

const sourceRoot = resolve('src');
const reportPath = resolve('dist/dark-theme-audit-report.json');
const shouldFix = process.argv.includes('--fix');
const styleExtensions = new Set(['.css', '.scss']);

function walk(directory, predicate = () => true) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path, predicate);
    return predicate(path) ? [path] : [];
  });
}

const styleFiles = walk(sourceRoot, path => styleExtensions.has(extname(path).toLowerCase()));
const typeScriptFiles = walk(resolve('src/app'), path => path.endsWith('.ts'));
const appStyleFiles = styleFiles.filter(path => path.startsWith(`${resolve('src/app')}\\`) || path.startsWith(`${resolve('src/app')}/`));

function extractGlobalComponentStyles() {
  const globalStyles = new Set();
  for (const tsPath of typeScriptFiles) {
    const source = readFileSync(tsPath, 'utf8');
    if (!/encapsulation\s*:\s*ViewEncapsulation\.None/.test(source)) continue;

    for (const match of source.matchAll(/styleUrl\s*:\s*(['"])(.*?)\1/g)) {
      const stylePath = resolve(dirname(tsPath), match[2]);
      if (existsSync(stylePath)) globalStyles.add(stylePath);
    }
    for (const match of source.matchAll(/styleUrls\s*:\s*\[([\s\S]*?)\]/g)) {
      for (const styleMatch of match[1].matchAll(/(['"])(.*?\.(?:css|scss))\1/g)) {
        const stylePath = resolve(dirname(tsPath), styleMatch[2]);
        if (existsSync(stylePath)) globalStyles.add(stylePath);
      }
    }
  }

  const pending = [...globalStyles];
  while (pending.length > 0) {
    const stylePath = pending.pop();
    if (!stylePath) continue;
    const source = readFileSync(stylePath, 'utf8');
    for (const importMatch of source.matchAll(/@import\s+(?:url\()?\s*(['"])(.*?)\1\s*\)?/g)) {
      const importedPath = resolve(dirname(stylePath), importMatch[2]);
      if (existsSync(importedPath) && styleExtensions.has(extname(importedPath).toLowerCase()) && !globalStyles.has(importedPath)) {
        globalStyles.add(importedPath);
        pending.push(importedPath);
      }
    }
  }
  return globalStyles;
}

const globalComponentStyles = extractGlobalComponentStyles();
const scopedComponentStyles = appStyleFiles.filter(path => !globalComponentStyles.has(path));
const scopedComponentStyleSet = new Set(scopedComponentStyles);

function extractInlineStyleBlocks() {
  const blocks = [];
  for (const tsPath of typeScriptFiles) {
    const source = readFileSync(tsPath, 'utf8');
    const isGlobal = /encapsulation\s*:\s*ViewEncapsulation\.None/.test(source);
    let index = 0;
    for (const match of source.matchAll(/styles\s*:\s*\[\s*`([\s\S]*?)`\s*\]/g)) {
      index += 1;
      blocks.push({
        id: `${relative(process.cwd(), tsPath)}#inline-style-${index}`,
        source: match[1],
        scoped: !isGlobal,
      });
    }
  }
  return blocks;
}

const inlineStyleBlocks = extractInlineStyleBlocks();
const inlineScopedStyleIds = new Set(inlineStyleBlocks.filter(block => block.scoped).map(block => block.id));

const rootThemeSelector = /^(\s*)(body:not\(\s*\[\s*data-bs-theme\s*(?:=[^\]]+)?\]\s*\)|(?:html|body)?\s*\[\s*data-(?:bs-theme|layout-color|layout-mode)\s*(?:=[^\]]+)?\])(?=\s|,|\{|>|\.|#|:)/gm;

if (shouldFix) {
  let changedFiles = 0;
  let changedSelectors = 0;
  for (const path of scopedComponentStyles) {
    const source = readFileSync(path, 'utf8');
    const updated = source.replace(rootThemeSelector, (_match, indentation, selector) => {
      changedSelectors += 1;
      return `${indentation}:host-context(${selector.trim()})`;
    });
    if (updated !== source) {
      writeFileSync(path, updated, 'utf8');
      changedFiles += 1;
    }
  }
  console.log(`Dark selector migration: ${changedSelectors} selectors in ${changedFiles} scoped component styles.`);
}

function lineNumber(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function parseColor(value) {
  const text = value.trim().toLowerCase();
  const shortHex = /^#([0-9a-f]{3,4})$/.exec(text);
  const longHex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(text);
  if (shortHex) {
    const digits = shortHex[1];
    return {
      rgb: [0, 1, 2].map(index => parseInt(digits[index] + digits[index], 16)),
      alpha: digits.length === 4 ? parseInt(digits[3] + digits[3], 16) / 255 : 1,
    };
  }
  if (longHex) {
    return {
      rgb: [0, 2, 4].map(index => parseInt(longHex[1].slice(index, index + 2), 16)),
      alpha: longHex[2] ? parseInt(longHex[2], 16) / 255 : 1,
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(text);
  if (!rgb) return undefined;
  const alphaText = rgb[4];
  const alpha = !alphaText ? 1 : alphaText.endsWith('%') ? Number(alphaText.slice(0, -1)) / 100 : Number(alphaText);
  return { rgb: rgb.slice(1, 4).map(Number), alpha };
}

function composite(color, background) {
  return color.rgb.map((channel, index) => channel * color.alpha + background[index] * (1 - color.alpha));
}

function luminance(rgb) {
  const channels = rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const fallbackDarkSurface = [42, 49, 66];
  const backgroundRgb = composite(background, fallbackDarkSurface);
  const foregroundRgb = composite(foreground, backgroundRgb);
  const foregroundLuminance = luminance(foregroundRgb);
  const backgroundLuminance = luminance(backgroundRgb);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

const parseErrors = [];
const brokenSelectors = [];
const lowContrastPairs = [];
const contrastWarnings = [];
const lightSurfaceFiles = new Map();
const filesWithDarkCoverage = new Set();
const intentionallyDarkFiles = new Set();
let totalLines = 0;
let darkRuleCount = 0;
let hostContextRuleCount = 0;

for (const path of styleFiles) {
  const source = readFileSync(path, 'utf8');
  totalLines += source.split(/\r?\n/).length;
  if (/dark-theme:\s*intentionally dark/i.test(source)) intentionallyDarkFiles.add(path);

  if (scopedComponentStyles.includes(path)) {
    for (const match of source.matchAll(rootThemeSelector)) {
      brokenSelectors.push({ file: relative(process.cwd(), path), line: lineNumber(source, match.index) });
    }
  }

  let root;
  try {
    root = postcss.parse(source, { from: path });
  } catch (error) {
    parseErrors.push({ file: relative(process.cwd(), path), message: error.reason ?? error.message });
    continue;
  }

  root.walkRules(rule => {
    const contextSelectors = [];
    let current = rule;
    while (current) {
      if (current.type === 'rule') contextSelectors.push(current.selector);
      current = current.parent;
    }
    const context = contextSelectors.join(' ');
    const positiveThemeContext = context.replace(/:not\([^)]*\)/g, '');
    const isDark = /data-(?:bs-theme|layout-color|layout-mode)[^\]]*dark/i.test(positiveThemeContext);
    if (isDark) {
      darkRuleCount += 1;
      filesWithDarkCoverage.add(path);
    }
    if (/:host-context\(/i.test(rule.selector)) hostContextRuleCount += 1;

    const declarations = {};
    rule.each(node => {
      if (node.type !== 'decl') return;
      declarations[node.prop.toLowerCase()] = node.value;
      if (!isDark && /^(?:background|background-color)$/.test(node.prop)
        && /(?:#fff(?:fff)?\b|#f[0-9a-f]{5}\b|\bwhite\b)/i.test(node.value)) {
        const key = relative(process.cwd(), path);
        lightSurfaceFiles.set(key, (lightSurfaceFiles.get(key) ?? 0) + 1);
      }
    });

    if (!isDark) return;
    const foreground = parseColor(declarations.color ?? '');
    const backgroundValue = declarations['background-color'] ?? declarations.background ?? '';
    const background = parseColor(backgroundValue);
    if (!foreground || !background) return;
    const ratio = contrastRatio(foreground, background);
    const finding = {
      file: relative(process.cwd(), path),
      line: rule.source?.start?.line,
      selector: rule.selector,
      foreground: declarations.color,
      background: backgroundValue,
      ratio: Number(ratio.toFixed(2)),
    };
    if (ratio < 3) lowContrastPairs.push(finding);
    else if (ratio < 4.5) contrastWarnings.push(finding);
  });
}

for (const block of inlineStyleBlocks) {
  const source = block.source;
  totalLines += source.split(/\r?\n/).length;
  if (/dark-theme:\s*intentionally dark/i.test(source)) intentionallyDarkFiles.add(block.id);

  if (block.scoped) {
    for (const match of source.matchAll(rootThemeSelector)) {
      brokenSelectors.push({ file: block.id, line: lineNumber(source, match.index) });
    }
  }

  let root;
  try {
    root = postcss.parse(source, { from: block.id });
  } catch (error) {
    parseErrors.push({ file: block.id, message: error.reason ?? error.message });
    continue;
  }

  root.walkRules(rule => {
    const contextSelectors = [];
    let current = rule;
    while (current) {
      if (current.type === 'rule') contextSelectors.push(current.selector);
      current = current.parent;
    }
    const context = contextSelectors.join(' ');
    const positiveThemeContext = context.replace(/:not\([^)]*\)/g, '');
    const isDark = /data-(?:bs-theme|layout-color|layout-mode)[^\]]*dark/i.test(positiveThemeContext);
    if (isDark) {
      darkRuleCount += 1;
      filesWithDarkCoverage.add(block.id);
    }
    if (/:host-context\(/i.test(rule.selector)) hostContextRuleCount += 1;

    const declarations = {};
    rule.each(node => {
      if (node.type !== 'decl') return;
      declarations[node.prop.toLowerCase()] = node.value;
      if (!isDark && /^(?:background|background-color)$/.test(node.prop)
        && /(?:#fff(?:fff)?\b|#f[0-9a-f]{5}\b|\bwhite\b)/i.test(node.value)) {
        lightSurfaceFiles.set(block.id, (lightSurfaceFiles.get(block.id) ?? 0) + 1);
      }
    });

    if (!isDark) return;
    const foreground = parseColor(declarations.color ?? '');
    const backgroundValue = declarations['background-color'] ?? declarations.background ?? '';
    const background = parseColor(backgroundValue);
    if (!foreground || !background) return;
    const ratio = contrastRatio(foreground, background);
    const finding = {
      file: block.id,
      line: rule.source?.start?.line,
      selector: rule.selector,
      foreground: declarations.color,
      background: backgroundValue,
      ratio: Number(ratio.toFixed(2)),
    };
    if (ratio < 3) lowContrastPairs.push(finding);
    else if (ratio < 4.5) contrastWarnings.push(finding);
  });
}

const themeFixPath = resolve('src/assets/css/theme-fix.css');
const themeFix = readFileSync(themeFixPath, 'utf8');
const requiredThemeContracts = [
  '--kws-dark-bg',
  '--kws-dark-surface',
  '--kws-dark-surface-raised',
  '--kws-dark-text',
  '--kws-dark-muted',
  '--kws-dark-border',
  'color-scheme: dark',
  "html[data-bs-theme='dark']",
];
const missingThemeContracts = requiredThemeContracts.filter(contract => !themeFix.includes(contract));

const requiredThemeAssets = [
  'src/assets/css/modern/bootstrap-rtl.min.css',
  'src/assets/css/modern/bootstrap-dark-rtl.min.css',
  'src/assets/css/modern/app-rtl.min.css',
  'src/assets/css/modern/app-dark-rtl.min.css',
];
const missingThemeAssets = requiredThemeAssets.filter(path => !existsSync(resolve(path)));
const uncoveredComponentLightSurfaces = [...lightSurfaceFiles.entries()]
  .filter(([path]) => scopedComponentStyleSet.has(resolve(path))
    || globalComponentStyles.has(resolve(path))
    || inlineScopedStyleIds.has(path))
  .filter(([path]) => {
    const key = inlineScopedStyleIds.has(path) ? path : resolve(path);
    return !filesWithDarkCoverage.has(key) && !intentionallyDarkFiles.has(key);
  })
  .map(([file, declarations]) => ({ file, declarations }))
  .sort((a, b) => b.declarations - a.declarations);

const report = {
  generatedAt: new Date().toISOString(),
  inventory: {
    styleFiles: styleFiles.length,
    inlineStyleBlocks: inlineStyleBlocks.length,
    appStyleFiles: appStyleFiles.length,
    globalComponentStyles: globalComponentStyles.size,
    scopedComponentStyles: scopedComponentStyles.length,
    totalLines,
    darkRuleCount,
    hostContextRuleCount,
    globalComponentStyleFiles: [...globalComponentStyles].map(path => relative(process.cwd(), path)).sort(),
    scopedComponentStyleFiles: [...scopedComponentStyles].map(path => relative(process.cwd(), path)).sort(),
  },
  brokenSelectors,
  parseErrors,
  lowContrastPairs,
  contrastWarnings,
  lightSurfaceCandidates: [...lightSurfaceFiles.entries()]
    .map(([file, declarations]) => ({ file, declarations }))
    .sort((a, b) => b.declarations - a.declarations),
  uncoveredComponentLightSurfaces,
  missingThemeContracts,
  missingThemeAssets,
};

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(`Dark theme audit inventory: ${styleFiles.length} style files + ${inlineStyleBlocks.length} inline style blocks, ${totalLines} lines.`);
console.log(`Component styles: ${scopedComponentStyles.length} scoped, ${globalComponentStyles.size} global.`);
console.log(`Dark rules: ${darkRuleCount}; :host-context rules: ${hostContextRuleCount}.`);
console.log(`Contrast: ${lowContrastPairs.length} failures below 3:1, ${contrastWarnings.length} review items below 4.5:1.`);
console.log(`Light-surface candidates recorded in ${lightSurfaceFiles.size} files.`);
console.log(`Component light-surface coverage: ${uncoveredComponentLightSurfaces.length === 0 ? 'complete' : `${uncoveredComponentLightSurfaces.length} uncovered file(s)`}.`);

const errors = [
  ...parseErrors.map(item => `${item.file}: CSS parse error: ${item.message}`),
  ...brokenSelectors.map(item => `${item.file}:${item.line}: root theme selector in scoped component CSS must use :host-context()`),
  ...lowContrastPairs.map(item => `${item.file}:${item.line}: dark contrast ${item.ratio}:1 for ${item.selector}`),
  ...contrastWarnings.map(item => `${item.file}:${item.line}: dark text contrast ${item.ratio}:1 is below 4.5:1 for ${item.selector}`),
  ...uncoveredComponentLightSurfaces.map(item => `${item.file}: ${item.declarations} light-surface declaration(s) without dark coverage`),
  ...missingThemeContracts.map(contract => `missing global dark theme contract: ${contract}`),
  ...missingThemeAssets.map(path => `missing theme asset: ${path}`),
];

if (errors.length > 0) {
  console.error('Dark theme audit failed:');
  errors.slice(0, 30).forEach(error => console.error(`- ${error}`));
  if (errors.length > 30) console.error(`- ...and ${errors.length - 30} more`);
  process.exit(1);
}

console.log('Dark theme audit passed.');
