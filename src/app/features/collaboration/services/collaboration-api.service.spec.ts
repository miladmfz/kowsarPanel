import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { CollaborationApiService } from './collaboration-api.service';

describe('CollaborationApiService', () => {
  let service: CollaborationApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({ appVersion: '1', production: false, apiUrl: 'https://api.test/api/', baseHref: '/' });
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(),
      { provide: AppConfigService, useValue: config }
    ] });
    service = TestBed.inject(CollaborationApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads only the authenticated users room collection', () => {
    service.getRooms().subscribe(value => expect(value.length).toBe(1));
    const request = http.expectOne('https://api.test/api/Collaboration/rooms');
    expect(request.request.method).toBe('GET');
    request.flush([{ roomCode: 10 }]);
  });

  it('loads the authenticated employee directory and starts a private conversation by DepartmentUserCode', () => {
    service.getUsers('رضا').subscribe(value => expect(value[0].subject).toBe('KOWSAR:42'));
    const usersRequest = http.expectOne(request => request.url === 'https://api.test/api/Collaboration/users');
    expect(usersRequest.request.params.get('query')).toBe('رضا');
    usersRequest.flush([{ subject: 'KOWSAR:42', departmentUserCode: 42 }]);

    service.startDirect(42).subscribe(value => expect(value.roomCode).toBe(17));
    const directRequest = http.expectOne('https://api.test/api/Collaboration/direct');
    expect(directRequest.request.method).toBe('POST');
    expect(directRequest.request.body).toEqual({ departmentUserCode: 42 });
    directRequest.flush({ roomCode: 17 });
  });

  it('loads and acknowledges persistent collaboration notifications', () => {
    service.getNotifications(10).subscribe(value => expect(value.length).toBe(1));
    const listRequest = http.expectOne(request => request.url === 'https://api.test/api/Collaboration/notifications');
    expect(listRequest.request.params.get('take')).toBe('10');
    listRequest.flush([{ notificationCode: 9 }]);

    service.readNotification(9).subscribe();
    http.expectOne('https://api.test/api/Collaboration/notifications/9/read').flush(null);

    service.readAllNotifications().subscribe();
    http.expectOne('https://api.test/api/Collaboration/notifications/read-all').flush(null);
  });

  it('sends thread, priority, acknowledgement and schedule as a typed post command', () => {
    const command = {
      body: 'پیام تست', rootPostRef: 12, parentPostRef: 13,
      priority: 'Urgent' as const, requireAcknowledgement: true,
      scheduledFor: '2026-10-01T10:00:00.000Z', mentionSubjects: ['KOWSAR:31'], mentionGroups: ['support']
    };
    service.createPost(5, command).subscribe();
    const request = http.expectOne('https://api.test/api/Collaboration/rooms/5/posts');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(command);
    request.flush({ postCode: 99 });
  });

  it('downloads attachments through HttpClient so JWT interceptor can authorize the request', () => {
    service.downloadAttachment(77).subscribe(value => expect(value.size).toBe(3));
    const request = http.expectOne('https://api.test/api/Collaboration/attachments/77');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['abc']));
  });

  it('keeps group, membership and integration administration behind the typed API boundary', () => {
    service.addMember(5, { subject: 'KOWSAR:31', memberRole: 'Member' }).subscribe();
    const memberRequest = http.expectOne('https://api.test/api/Collaboration/rooms/5/members');
    expect(memberRequest.request.body).toEqual({ subject: 'KOWSAR:31', memberRole: 'Member' });
    memberRequest.flush(null);

    service.createGroup({ groupKey: 'support', title: 'پشتیبانی', memberSubjects: ['KOWSAR:31'] }).subscribe();
    const groupRequest = http.expectOne('https://api.test/api/Collaboration/groups');
    expect(groupRequest.request.method).toBe('POST');
    groupRequest.flush({ groupCode: 8 });

    service.createIntegration({ title: 'نامه جدید', eventPattern: 'Support.LetterCreated', targetRoomRef: 5 }).subscribe();
    const integrationRequest = http.expectOne('https://api.test/api/Collaboration/integrations');
    expect(integrationRequest.request.body.targetRoomRef).toBe(5);
    integrationRequest.flush({ integrationCode: 9 });
  });
});
