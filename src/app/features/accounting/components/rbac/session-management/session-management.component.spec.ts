import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthSessionRecord } from 'src/app/auth-kowsar/auth-api.models';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';
import { SessionManagementComponent } from './session-management.component';

describe('SessionManagementComponent', () => {
  let fixture: ComponentFixture<SessionManagementComponent>;
  let component: SessionManagementComponent;
  let api: jasmine.SpyObj<AuthKowsarWebApiService>;

  const session: AuthSessionRecord = {
    sessionId: '2e6ff338-cf89-42ee-94d1-046ff14ba5f7',
    subject: 'KOWSAR:7',
    displayName: 'کاربر تست',
    deviceId: 'device-1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/153.0',
    ipAddress: '127.0.0.1',
    createdAt: '2026-09-16T10:00:00Z',
    lastSeenAt: '2026-09-16T10:05:00Z',
    expiresAt: '2026-09-23T10:00:00Z',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<AuthKowsarWebApiService>(
      'AuthKowsarWebApiService',
      ['GetAuthSessions', 'RevokeAuthSession', 'RevokeAllAuthSessions'],
    );
    api.GetAuthSessions.and.returnValue(of({ sessions: [session] }));
    api.RevokeAuthSession.and.returnValue(of(undefined));
    api.RevokeAllAuthSessions.and.returnValue(of({ subject: session.subject, tokenVersion: 2 }));

    await TestBed.configureTestingModule({
      imports: [SessionManagementComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthKowsarWebApiService, useValue: api },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['success', 'error']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
      ],
    }).compileComponents();

    sessionStorage.clear();
    fixture = TestBed.createComponent(SessionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => sessionStorage.clear());

  it('loads active sessions and describes the browser device', () => {
    expect(api.GetAuthSessions).toHaveBeenCalledWith(false, 300);
    expect(component.sessions()).toEqual([session]);
    expect(component.deviceLabel(session)).toBe('Chrome / Windows');
  });

  it('revokes a selected session after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.revoke(session);

    expect(api.RevokeAuthSession).toHaveBeenCalledWith(session.sessionId);
  });
});
