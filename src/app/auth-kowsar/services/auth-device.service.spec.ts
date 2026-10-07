import { AuthDeviceService } from './auth-device.service';

describe('AuthDeviceService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('creates one stable non-secret identifier for the current browser', () => {
    const service = new AuthDeviceService();

    const first = service.deviceId;
    const second = service.deviceId;

    expect(first.length).toBeGreaterThan(10);
    expect(second).toBe(first);
    expect(localStorage.getItem('kowsar.device_id')).toBe(first);
  });
});
