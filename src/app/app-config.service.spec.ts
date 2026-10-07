import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;

  beforeEach(() => {
    service = new AppConfigService();
  });

  it('accepts a valid runtime configuration', () => {
    service.initialize({
      appVersion: '1.0.0',
      production: false,
      apiUrl: 'http://localhost:60007/api/',
      baseHref: '/',
    });

    expect(service.apiUrl).toBe('http://localhost:60007/api/');
    expect(service.AppVersion).toBe('1.0.0');
  });

  it('rejects a configuration without required fields', () => {
    expect(() => service.initialize({ production: false })).toThrowError(
      'Runtime config field "appVersion" is required.'
    );
  });

  it('rejects an API URL that cannot be safely joined with route names', () => {
    expect(() =>
      service.initialize({
        appVersion: '1.0.0',
        production: false,
        apiUrl: 'http://localhost:60007/api',
        baseHref: '/',
      })
    ).toThrowError('Runtime config field "apiUrl" must end with "/".');
  });

  it('rejects public HTTP endpoints in production', () => {
    expect(() =>
      service.initialize({
        appVersion: '1.0.0',
        production: true,
        apiUrl: 'http://203.0.113.10/api/',
        baseHref: '/',
      })
    ).toThrowError('Runtime config field "apiUrl" must use HTTPS/WSS in production.');
  });

  it('accepts secure public endpoints and private on-premise HTTP endpoints', () => {
    service.initialize({
      appVersion: '1.0.0',
      production: true,
      apiUrl: 'https://panel.example.test/api/',
      localapiUrl: 'http://192.168.1.27:60006/api/',
      baseHref: '/',
      santralWebPhone: {
        wsUrl: 'wss://panel.example.test/asterisk-ws',
        domain: 'pbx.internal',
        autoRegister: true,
      },
    });

    expect(service.apiUrl).toBe('https://panel.example.test/api/');
  });

  it('rejects credentials embedded in runtime endpoint URLs', () => {
    expect(() =>
      service.initialize({
        appVersion: '1.0.0',
        production: false,
        apiUrl: 'http://user:password@localhost:60007/api/',
        baseHref: '/',
      })
    ).toThrowError('Runtime config field "apiUrl" must not contain credentials.');
  });
});
