import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CentralRoleConfiguration } from 'src/app/auth-kowsar/auth-api.models';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';
import { CentralroleComponent } from './centralrole.component';

describe('CentralroleComponent', () => {
  let fixture: ComponentFixture<CentralroleComponent>;
  let component: CentralroleComponent;
  let api: jasmine.SpyObj<AuthKowsarWebApiService>;

  const configuration: CentralRoleConfiguration = {
    centralRef: 1843,
    centralName: 'مرکز تست',
    version: 'A'.repeat(64),
    roles: [
      { roleCode: 34, roleName: 'ADMIN', roleTitle: 'مدیر سیستم', enabled: true, locked: true },
      { roleCode: 43, roleName: 'REPORT_VIEWER', roleTitle: 'گزارش‌گیر', enabled: false, locked: false },
    ],
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<AuthKowsarWebApiService>(
      'AuthKowsarWebApiService',
      ['GetCurrentCentralRoleConfiguration', 'UpdateCurrentCentralRoleConfiguration'],
    );
    api.GetCurrentCentralRoleConfiguration.and.returnValue(of(configuration));
    api.UpdateCurrentCentralRoleConfiguration.and.returnValue(of({
      ...configuration,
      version: 'B'.repeat(64),
      roles: configuration.roles.map(role => role.roleName === 'REPORT_VIEWER' ? { ...role, enabled: true } : role),
    }));

    await TestBed.configureTestingModule({
      imports: [CentralroleComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthKowsarWebApiService, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CentralroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders server-provided roles for the authenticated Central and locks ADMIN', () => {
    const element = fixture.nativeElement as HTMLElement;
    const inputs = element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

    expect(api.GetCurrentCentralRoleConfiguration).toHaveBeenCalled();
    expect(element.textContent).toContain('مرکز تست');
    expect(element.textContent).toContain('REPORT_VIEWER');
    expect(inputs.length).toBe(2);
    expect(inputs[0].disabled).toBeTrue();
  });

  it('saves the selected server role codes with version and without CentralRef', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const input = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1];
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    (component as unknown as { save(): void }).save();

    expect(api.UpdateCurrentCentralRoleConfiguration).toHaveBeenCalledWith({
      enabledRoleRefs: [34, 43],
      expectedVersion: 'A'.repeat(64),
    });
    const request = api.UpdateCurrentCentralRoleConfiguration.calls.mostRecent().args[0] as unknown as Record<string, unknown>;
    expect(request['centralRef']).toBeUndefined();
  });
});
