import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';

import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CollaborationPost, CollaborationRoom } from '../../models/collaboration.models';
import { CollaborationApiService } from '../../services/collaboration-api.service';
import {
  CollaborationConnectionState,
  CollaborationRealtimeService
} from '../../services/collaboration-realtime.service';
import { CollaborationHomeComponent } from './collaboration-home.component';

describe('CollaborationHomeComponent realtime behavior', () => {
  let fixture: ComponentFixture<CollaborationHomeComponent>;
  let component: CollaborationHomeComponent;
  let api: jasmine.SpyObj<CollaborationApiService>;
  let postChanged: Subject<{ roomCode: number; postCode: number }>;
  let unreadChanged: Subject<{ roomCode: number; postCode: number }>;
  let connectionState: BehaviorSubject<CollaborationConnectionState>;

  const room = (roomCode: number): CollaborationRoom => ({
    roomCode,
    roomType: 'Direct',
    title: `Room ${roomCode}`,
    description: null,
    linkedEntityType: null,
    linkedEntityCode: null,
    directSubject: 'KOWSAR:2',
    isArchived: false,
    createdAt: '2026-09-27T00:00:00Z',
    updatedAt: '2026-09-27T00:00:00Z',
    memberRole: 'Member',
    isMuted: false,
    unreadCount: 0
  });

  const post = (postCode: number, roomCode: number): CollaborationPost => ({
    postCode,
    roomRef: roomCode,
    rootPostRef: null,
    parentPostRef: null,
    authorSubject: 'KOWSAR:1',
    authorDisplayName: 'Test User',
    actorType: 'User',
    messageType: 'Text',
    body: `Message ${postCode}`,
    priority: 'Standard',
    requireAcknowledgement: false,
    scheduledFor: null,
    publishedAt: '2026-09-27T00:00:00Z',
    editedAt: null,
    createdAt: '2026-09-27T00:00:00Z',
    isAcknowledged: false,
    ackCount: 0,
    replyCount: 0,
    isFollowed: false,
    actions: [],
    attachments: []
  });

  beforeEach(async () => {
    api = jasmine.createSpyObj<CollaborationApiService>('CollaborationApiService', [
      'getUsers', 'getGroups', 'getRooms', 'getPosts', 'getBookmarks', 'createPost',
      'markRead', 'uploadAttachment'
    ]);
    api.getUsers.and.returnValue(of([]));
    api.getGroups.and.returnValue(of([]));
    api.getRooms.and.returnValue(of([]));
    api.getPosts.and.returnValue(of([]));
    api.getBookmarks.and.returnValue(of([]));
    api.markRead.and.returnValue(of(undefined));

    postChanged = new Subject();
    unreadChanged = new Subject();
    connectionState = new BehaviorSubject<CollaborationConnectionState>('disconnected');
    const realtime = {
      postChanged$: postChanged.asObservable(),
      typing$: new Subject<{ roomCode: number; displayName: string; isTyping: boolean }>().asObservable(),
      unreadChanged$: unreadChanged.asObservable(),
      roomChanged$: new Subject<{ roomCode: number }>().asObservable(),
      reminderDue$: new Subject<{ reminderCode: number; postCode: number }>().asObservable(),
      state$: connectionState.asObservable(),
      openRoom: jasmine.createSpy('openRoom').and.resolveTo(),
      typing: jasmine.createSpy('typing').and.resolveTo()
    };

    await TestBed.configureTestingModule({
      imports: [CollaborationHomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: CollaborationApiService, useValue: api },
        { provide: CollaborationRealtimeService, useValue: realtime },
        { provide: PermissionService, useValue: { isAdmin: false, hasPermission: () => true } },
        { provide: NotificationService, useValue: jasmine.createSpyObj('NotificationService', ['info', 'success']) },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']) },
        { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({})) } }
      ]
    })
      .overrideComponent(CollaborationHomeComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CollaborationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('reloads the selected conversation immediately after a successful send', () => {
    component.selectedRoom = room(10);
    component.message = '  hello realtime  ';
    api.createPost.and.returnValue(of({ postCode: 101 }));
    spyOn(component, 'loadPosts');

    component.send();

    expect(api.createPost).toHaveBeenCalledWith(10, jasmine.objectContaining({ body: 'hello realtime' }));
    expect(component.loadPosts).toHaveBeenCalledTimes(1);
    expect(component.message).toBe('');
    expect(component.saving).toBeFalse();
  });

  it('ignores a late post response from the previously selected room', () => {
    const firstResponse = new Subject<CollaborationPost[]>();
    const secondResponse = new Subject<CollaborationPost[]>();
    api.getPosts.and.returnValues(firstResponse.asObservable(), secondResponse.asObservable());

    component.selectedRoom = room(10);
    component.loadPosts(false);
    component.selectedRoom = room(20);
    component.loadPosts(false);
    secondResponse.next([post(202, 20)]);
    firstResponse.next([post(101, 10)]);

    expect(component.posts.map(item => item.postCode)).toEqual([202]);
  });

  it('refreshes the active conversation and room unread state on realtime events', () => {
    component.selectedRoom = room(10);
    spyOn(component, 'loadPosts');
    spyOn(component, 'loadRooms');

    postChanged.next({ roomCode: 10, postCode: 101 });
    unreadChanged.next({ roomCode: 10, postCode: 101 });

    expect(component.loadPosts).toHaveBeenCalledOnceWith(false);
    expect(component.loadRooms).toHaveBeenCalledTimes(2);
    expect(component.loadRooms).toHaveBeenCalledWith(false);
  });

  it('clears only the transient realtime error after the connection recovers', () => {
    component.error = 'اتصال زنده برقرار نشد؛ دریافت معمولی پیام‌ها همچنان فعال است.';

    connectionState.next('connected');

    expect(component.error).toBe('');
  });
});
