import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = new LoadingService();
  });

  it('starts hidden', () => {
    expect(service.isVisible()).toBeFalse();
  });

  it('stays visible until every concurrent request finishes', () => {
    service.show();
    service.show();

    service.hide();
    expect(service.isVisible()).toBeTrue();

    service.hide();
    expect(service.isVisible()).toBeFalse();
  });

  it('does not underflow after an extra hide call', () => {
    service.hide();
    service.show();

    expect(service.isVisible()).toBeTrue();

    service.hide();
    expect(service.isVisible()).toBeFalse();
  });
});
