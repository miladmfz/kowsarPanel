import { AuthGuard } from './app-shell/framework-services/AuthGuard';
import { routes } from './app.routes';

describe('application route policy', () => {
  it('keeps authentication routes public', () => {
    const authRoute = routes.find(route => route.path === 'auth');

    expect(authRoute).toBeDefined();
    expect(authRoute?.canActivate).toBeUndefined();
  });

  it('protects the application shell with AuthGuard', () => {
    const shellRoute = routes.find(route => route.path === '');

    expect(shellRoute).toBeDefined();
    expect(shellRoute?.canActivate).toContain(AuthGuard);
  });

  it('keeps the wildcard route last', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });
});

