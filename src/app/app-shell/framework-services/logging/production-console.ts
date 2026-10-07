export interface ConsoleOutput {
  debug(...data: unknown[]): void;
  info(...data: unknown[]): void;
  log(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

/**
 * Prevent application data from being written to the browser console in
 * production. Development keeps the native console for local diagnostics.
 * Production warnings and errors keep only their first textual message so a
 * startup failure remains diagnosable without exposing response payloads.
 */
export function configureProductionConsole(
  production: boolean,
  target: ConsoleOutput = console,
): void {
  if (!production) {
    return;
  }

  const discard = (..._data: unknown[]): void => undefined;
  const nativeWarn = target.warn.bind(target);
  const nativeError = target.error.bind(target);

  target.debug = discard;
  target.info = discard;
  target.log = discard;
  target.warn = (message?: unknown): void => {
    nativeWarn(typeof message === 'string' ? message : 'Production warning');
  };
  target.error = (message?: unknown): void => {
    nativeError(typeof message === 'string' ? message : 'Production error');
  };
}
