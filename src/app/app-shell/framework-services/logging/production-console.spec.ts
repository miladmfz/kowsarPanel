import {
  configureProductionConsole,
  ConsoleOutput,
} from './production-console';

describe('configureProductionConsole', () => {
  function createConsole(): {
    target: ConsoleOutput;
    methods: Record<keyof ConsoleOutput, jasmine.Spy>;
  } {
    const methods = {
      debug: jasmine.createSpy('debug'),
      info: jasmine.createSpy('info'),
      log: jasmine.createSpy('log'),
      warn: jasmine.createSpy('warn'),
      error: jasmine.createSpy('error'),
    };

    return { target: { ...methods }, methods };
  }

  it('keeps console output available in development', () => {
    const { target, methods } = createConsole();

    configureProductionConsole(false, target);
    target.log('development message');
    target.error('development error');

    expect(methods.log).toHaveBeenCalledWith('development message');
    expect(methods.error).toHaveBeenCalledWith('development error');
  });

  it('suppresses routine output and strips warning/error payloads in production', () => {
    const { target, methods } = createConsole();

    configureProductionConsole(true, target);

    target.debug({ accessToken: 'sensitive' });
    target.info({ session: 'sensitive' });
    target.log({ response: 'sensitive' });
    target.warn('Request warning', { user: 'sensitive' });
    target.error('Request failed', { request: 'sensitive' });

    expect(methods.debug).not.toHaveBeenCalled();
    expect(methods.info).not.toHaveBeenCalled();
    expect(methods.log).not.toHaveBeenCalled();
    expect(methods.warn).toHaveBeenCalledOnceWith('Request warning');
    expect(methods.error).toHaveBeenCalledOnceWith('Request failed');
  });

  it('replaces non-text warning/error values with generic messages', () => {
    const { target, methods } = createConsole();

    configureProductionConsole(true, target);
    target.warn({ user: 'sensitive' });
    target.error(new Error('response body'));

    expect(methods.warn).toHaveBeenCalledOnceWith('Production warning');
    expect(methods.error).toHaveBeenCalledOnceWith('Production error');
  });
});
