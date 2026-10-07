import { withWebSocketAccessToken } from './webphone.service';

describe('withWebSocketAccessToken', () => {
  it('adds an encoded access token to the WebSocket URL', () => {
    const result = withWebSocketAccessToken('ws://localhost:60007/asterisk-ws', 'a+b/c=');

    expect(result).toBe('ws://localhost:60007/asterisk-ws?access_token=a%2Bb%2Fc%3D');
  });

  it('preserves existing query parameters', () => {
    const result = withWebSocketAccessToken('wss://example.test/asterisk-ws?transport=sip', 'token');

    expect(result).toContain('transport=sip');
    expect(result).toContain('access_token=token');
  });

  it('replaces an existing access token instead of duplicating it', () => {
    const result = withWebSocketAccessToken('wss://example.test/asterisk-ws?access_token=old', 'new');

    expect(result).toBe('wss://example.test/asterisk-ws?access_token=new');
  });
});
