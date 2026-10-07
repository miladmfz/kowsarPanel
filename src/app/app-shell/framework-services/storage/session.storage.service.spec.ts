import { SessionStorageService } from './session.storage.service';
import { ACCESS_TOKEN_NAME } from '../base/configuration';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    service = new SessionStorageService();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('stores scalar session values without JSON quoting', () => {
    service.setString('SessionId', 'session-123');

    expect(sessionStorage.getItem('SessionId')).toBe('session-123');
    expect(service.sessionId).toBe('session-123');
  });

  it('round-trips objects as JSON values', () => {
    const user = { UserId: '7', DisplayName: 'Test User' };

    service.setItem('CurrentUser', user);

    expect(service.currentUser).toEqual(user);
  });

  it('keeps permission keys as an array used by access checks', () => {
    service.setItem('PermissionKeys', ['Dashboard.View', 'Orders.Edit']);

    expect(service.permissions).toEqual(['Dashboard.View', 'Orders.Edit']);
    expect(service.permissions.includes('Orders.Edit')).toBeTrue();
  });

  it('returns null for malformed JSON without throwing', () => {
    const consoleError = spyOn(console, 'error');
    sessionStorage.setItem('CurrentUser', '{invalid-json');

    expect(service.currentUser).toBeNull();
    expect(consoleError).toHaveBeenCalled();
  });

  it('clears authentication data while preserving the selected login type', () => {
    service.setString('SessionId', 'session-123');
    localStorage.setItem(ACCESS_TOKEN_NAME, 'token-123');
    localStorage.setItem('UserTypeLogin', 'KOWSAR');

    service.clearAuthentication();

    expect(service.sessionId).toBe('');
    expect(localStorage.getItem(ACCESS_TOKEN_NAME)).toBeNull();
    expect(localStorage.getItem('UserTypeLogin')).toBe('KOWSAR');
  });

  it('stores access tokens only for the current browser session', () => {
    service.accessToken = 'token-123';

    expect(service.accessToken).toBe('token-123');
    expect(sessionStorage.getItem(ACCESS_TOKEN_NAME)).toBe('token-123');
    expect(localStorage.getItem(ACCESS_TOKEN_NAME)).toBeNull();
  });

  it('selects the correct login route from the persisted user type', () => {
    expect(service.loginRoute).toBe('/auth/login-person');

    localStorage.setItem('UserTypeLogin', 'KOWSAR');

    expect(service.loginRoute).toBe('/auth/login-kowsar');
  });
});
