import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import {
  CollaborationBookmark,
  CollaborationGroup,
  CollaborationIntegration,
  CollaborationPlaybook,
  CollaborationPost,
  CollaborationPriority,
  CollaborationRoom,
  CollaborationRun,
  CollaborationSearchResult,
  CollaborationUser,
  CreatePostCommand
} from '../../models/collaboration.models';
import { CollaborationApiService } from '../../services/collaboration-api.service';
import { CollaborationRealtimeService } from '../../services/collaboration-realtime.service';

type CollaborationView = 'conversation' | 'search' | 'playbooks' | 'administration';

@Component({
  selector: 'app-collaboration-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collaboration-home.component.html',
  styleUrl: './collaboration-home.component.scss'
})
export class CollaborationHomeComponent implements OnInit, OnDestroy {
  private readonly realtimeConnectionError = 'اتصال زنده برقرار نشد؛ دریافت معمولی پیام‌ها همچنان فعال است.';
  private readonly api = inject(CollaborationApiService);
  private readonly realtime = inject(CollaborationRealtimeService);
  private readonly permissions = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private requestedRoomCode = 0;
  private postsRequestId = 0;

  rooms: CollaborationRoom[] = [];
  selectedRoom?: CollaborationRoom;
  posts: CollaborationPost[] = [];
  threadRoot?: CollaborationPost;
  threadPosts: CollaborationPost[] = [];
  bookmarks: CollaborationBookmark[] = [];
  playbooks: CollaborationPlaybook[] = [];
  runs: CollaborationRun[] = [];
  groups: CollaborationGroup[] = [];
  integrations: CollaborationIntegration[] = [];
  searchResults: CollaborationSearchResult[] = [];
  users: CollaborationUser[] = [];
  view: CollaborationView = 'conversation';
  loading = true;
  saving = false;
  error = '';
  typingName = '';

  message = '';
  priority: CollaborationPriority = 'Standard';
  requireAcknowledgement = false;
  scheduledFor = '';
  mentionSubjects: string[] = [];
  mentionGroups: string[] = [];
  pendingFile?: File;

  searchText = '';
  searchAuthor = '';
  searchDateFrom = '';
  searchDateTo = '';
  onlyWithAttachment = false;
  showCreateRoom = false;
  showUserPicker = false;
  userSearch = '';
  directStarting = false;
  newRoom = { roomType: 'General', title: '', description: '', linkedEntityType: '', linkedEntityCode: '' };
  bookmark = { title: '', url: '' };
  reminder = { postCode: 0, at: '' };
  newPlaybook = { title: '', description: '', stepsText: '' };
  newMember: { subject: string; personInfoRef: string; memberRole: 'Owner' | 'Moderator' | 'Member' } = { subject: '', personInfoRef: '', memberRole: 'Member' };
  newGroup: { groupKey: string; title: string; memberSubjects: string[] } = { groupKey: '', title: '', memberSubjects: [] };
  newIntegration = { title: '', eventPattern: '', webhookUrl: '' };

  get canCreateRoom(): boolean { return this.allowed('Collaboration.Room.Create'); }
  get canManageRoom(): boolean { return this.allowed('Collaboration.Room.Manage'); }
  get canCreatePost(): boolean { return this.allowed('Collaboration.Post.Create'); }
  get canViewPlaybook(): boolean { return this.allowed('Collaboration.Playbook.View'); }
  get canManagePlaybook(): boolean { return this.allowed('Collaboration.Playbook.Manage'); }
  get canRunPlaybook(): boolean { return this.allowed('Collaboration.Playbook.Run'); }
  get canManageIntegration(): boolean { return this.allowed('Collaboration.Integration.Manage'); }
  get canOpenAdministration(): boolean { return this.canManageRoom || this.canManageIntegration; }

  ngOnInit(): void {
    this.loadUsers();
    this.api.getGroups().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: groups => this.groups = groups });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.requestedRoomCode = Number(params.get('room')) || 0;
      const requested = this.rooms.find(room => room.roomCode === this.requestedRoomCode);
      if (requested && requested.roomCode !== this.selectedRoom?.roomCode) this.selectRoom(requested);
    });
    this.loadRooms();
    this.realtime.postChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event.roomCode === this.selectedRoom?.roomCode) this.loadPosts(false);
      this.loadRooms(false);
    });
    this.realtime.typing$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event.roomCode !== this.selectedRoom?.roomCode) return;
      this.typingName = event.isTyping ? event.displayName : '';
    });
    this.realtime.unreadChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadRooms(false));
    this.realtime.roomChanged$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadRooms(false));
    this.realtime.reminderDue$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.notification.info('زمان یادآوری یکی از پیام‌های همکاری رسیده است.'));
    this.realtime.state$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      if (state === 'connected' && this.error === this.realtimeConnectionError) this.error = '';
    });
  }

  ngOnDestroy(): void { void this.realtime.typing(this.selectedRoom?.roomCode ?? 0, false); }

  loadUsers(): void {
    this.api.getUsers(this.userSearch).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: users => this.users = users,
      error: () => this.error = 'دریافت فهرست کاربران انجام نشد.'
    });
  }

  loadRooms(showLoading = true): void {
    if (showLoading) this.loading = true;
    this.api.getRooms().pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: rooms => {
        this.rooms = rooms;
        if (!this.selectedRoom && rooms.length) this.selectRoom(rooms.find(x => x.roomCode === this.requestedRoomCode) ?? rooms[0]);
        else if (this.selectedRoom) this.selectedRoom = rooms.find(x => x.roomCode === this.selectedRoom?.roomCode) ?? this.selectedRoom;
      },
      error: () => this.error = 'بارگذاری اتاق‌های همکاری انجام نشد. نصب migration و دسترسی کاربر را بررسی کنید.'
    });
  }

  startDirect(user: CollaborationUser): void {
    if (user.isSelf || this.directStarting) return;
    this.directStarting = true;
    this.api.startDirect(user.departmentUserCode).pipe(finalize(() => this.directStarting = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        this.showUserPicker = false;
        this.api.getRooms().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: rooms => {
            this.rooms = rooms;
            const room = rooms.find(x => x.roomCode === result.roomCode);
            if (room) this.selectRoom(room);
          }
        });
      },
      error: () => this.error = 'شروع گفت‌وگوی مستقیم انجام نشد.'
    });
  }

  roomTitle(room: CollaborationRoom): string {
    if (room.roomType !== 'Direct' || !room.directSubject) return room.title;
    return this.users.find(user => user.subject.toLocaleLowerCase() === room.directSubject?.toLocaleLowerCase())?.displayName || room.title;
  }

  userLabel(subject: string): string {
    const user = this.users.find(item => item.subject.toLocaleLowerCase() === subject.toLocaleLowerCase());
    return user ? `${user.displayName}${user.departmentName ? ` — ${user.departmentName}` : ''}` : subject;
  }

  selectRoom(room: CollaborationRoom): void {
    this.selectedRoom = room;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { room: room.roomCode },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
    this.threadRoot = undefined;
    this.threadPosts = [];
    this.view = 'conversation';
    this.loadPosts();
    this.api.getBookmarks(room.roomCode).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: data => this.bookmarks = data });
    void this.realtime.openRoom(room.roomCode).catch(() => this.error = this.realtimeConnectionError);
  }

  selectRoomByCode(roomCode: number): void {
    const room = this.rooms.find(item => item.roomCode === roomCode);
    if (room) this.selectRoom(room);
  }

  loadPosts(markRead = true): void {
    if (!this.selectedRoom) return;
    const roomCode = this.selectedRoom.roomCode;
    const requestId = ++this.postsRequestId;
    this.api.getPosts(roomCode).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: posts => {
        if (requestId !== this.postsRequestId || this.selectedRoom?.roomCode !== roomCode) return;
        this.posts = posts;
        if (markRead && posts.length) this.api.markRead(roomCode, posts.at(-1)?.postCode).subscribe();
      }, error: () => this.error = 'دریافت پیام‌ها انجام نشد.'
    });
  }

  openThread(post: CollaborationPost): void {
    if (!this.selectedRoom) return;
    this.threadRoot = post;
    this.api.getPosts(this.selectedRoom.roomCode, post.postCode).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: posts => this.threadPosts = posts.filter(x => x.postCode !== post.postCode)
    });
  }

  send(root?: CollaborationPost): void {
    if (!this.selectedRoom || !this.message.trim() || this.saving) return;
    this.saving = true; this.error = '';
    const command: CreatePostCommand = {
      body: this.message.trim(), priority: this.priority,
      requireAcknowledgement: this.requireAcknowledgement,
      ...(root ? { rootPostRef: root.rootPostRef ?? root.postCode, parentPostRef: root.postCode } : {}),
      ...(this.scheduledFor ? { scheduledFor: new Date(this.scheduledFor).toISOString() } : {}),
      mentionSubjects: [...this.mentionSubjects], mentionGroups: [...this.mentionGroups]
    };
    const file = this.pendingFile;
    this.api.createPost(this.selectedRoom.roomCode, command).pipe(finalize(() => this.saving = false), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => {
        const afterUpload = () => { this.resetComposer(); this.loadPosts(); if (root) this.openThread(root); };
        if (file) this.api.uploadAttachment(result.postCode, file).subscribe({ next: afterUpload, error: () => { this.error = 'پیام ثبت شد ولی پیوست بارگذاری نشد.'; afterUpload(); } });
        else afterUpload();
      }, error: () => this.error = 'ارسال پیام انجام نشد.'
    });
  }

  acknowledge(post: CollaborationPost): void {
    this.api.acknowledge(post.postCode).subscribe({ next: () => { post.isAcknowledged = true; post.ackCount += 1; } });
  }

  follow(post: CollaborationPost): void {
    this.api.follow(post.rootPostRef ?? post.postCode, !post.isFollowed).subscribe({ next: () => post.isFollowed = !post.isFollowed });
  }

  setReminder(post: CollaborationPost): void { this.reminder = { postCode: post.postCode, at: '' }; }
  saveReminder(): void {
    if (!this.reminder.postCode || !this.reminder.at) return;
    this.api.addReminder(this.reminder.postCode, new Date(this.reminder.at).toISOString()).subscribe({
      next: () => this.reminder = { postCode: 0, at: '' }, error: () => this.error = 'ثبت یادآوری انجام نشد.'
    });
  }

  runAction(post: CollaborationPost, actionCode: number): void {
    this.api.executeAction(post.postCode, actionCode).subscribe({
      next: response => {
        if (response.result?.startsWith('/')) void this.router.navigateByUrl(response.result);
        this.loadPosts(false);
      }, error: () => this.error = 'اجرای عملیات مجاز نبود یا انجام نشد.'
    });
  }

  chooseFile(event: Event): void { this.pendingFile = (event.target as HTMLInputElement).files?.[0]; }

  download(attachmentCode: number, fileName: string): void {
    this.api.downloadAttachment(attachmentCode).subscribe(blob => {
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
      anchor.href = url; anchor.download = fileName; anchor.click(); URL.revokeObjectURL(url);
    });
  }

  createRoom(): void {
    if (!this.newRoom.title.trim()) return;
    this.api.createRoom({
      roomType: this.newRoom.roomType, title: this.newRoom.title.trim(), description: this.newRoom.description.trim() || undefined,
      linkedEntityType: this.newRoom.linkedEntityType.trim() || undefined, linkedEntityCode: this.newRoom.linkedEntityCode.trim() || undefined
    }).subscribe({ next: () => { this.showCreateRoom = false; this.newRoom = { roomType: 'General', title: '', description: '', linkedEntityType: '', linkedEntityCode: '' }; this.loadRooms(); } });
  }

  toggleMute(): void {
    if (!this.selectedRoom) return;
    this.api.mute(this.selectedRoom.roomCode, !this.selectedRoom.isMuted).subscribe({ next: () => this.selectedRoom!.isMuted = !this.selectedRoom!.isMuted });
  }

  addBookmark(): void {
    if (!this.selectedRoom || !this.bookmark.title.trim()) return;
    this.api.addBookmark(this.selectedRoom.roomCode, { title: this.bookmark.title.trim(), url: this.bookmark.url.trim() || undefined }).subscribe({
      next: () => { this.bookmark = { title: '', url: '' }; this.api.getBookmarks(this.selectedRoom!.roomCode).subscribe(x => this.bookmarks = x); }
    });
  }

  search(): void {
    this.view = 'search';
    this.api.search(this.searchText.trim(), this.selectedRoom?.roomCode, {
      author: this.searchAuthor.trim() || undefined,
      dateFrom: this.searchDateFrom || undefined,
      dateTo: this.searchDateTo || undefined,
      hasAttachment: this.onlyWithAttachment
    }).subscribe({
      next: results => this.searchResults = results, error: () => this.error = 'جست‌وجو انجام نشد.'
    });
  }

  showPlaybooks(): void {
    this.view = 'playbooks';
    this.api.getPlaybooks().subscribe({ next: data => this.playbooks = data, error: () => this.error = 'دریافت Playbookها انجام نشد.' });
    this.api.getRuns().subscribe({ next: data => this.runs = data });
  }

  createPlaybook(): void {
    const steps = this.newPlaybook.stepsText.split(/\r?\n/).map(x => x.trim()).filter(Boolean).map(title => ({ title }));
    if (!this.newPlaybook.title.trim() || !steps.length) return;
    this.api.createPlaybook({ title: this.newPlaybook.title.trim(), description: this.newPlaybook.description.trim(), steps }).subscribe({
      next: () => { this.newPlaybook = { title: '', description: '', stepsText: '' }; this.showPlaybooks(); }
    });
  }

  startRun(playbook: CollaborationPlaybook): void {
    this.api.startRun(playbook.playbookCode, { title: playbook.title }).subscribe({ next: () => { this.loadRooms(); this.showPlaybooks(); }, error: () => this.error = 'شروع Run انجام نشد.' });
  }

  setRunStep(run: CollaborationRun, stepCode: number, status: 'Pending' | 'Running' | 'Done' | 'Skipped'): void {
    this.api.updateRunStep(run.runCode, stepCode, status).subscribe({ next: () => this.showPlaybooks(), error: () => this.error = 'به‌روزرسانی مرحله انجام نشد.' });
  }

  showAdministration(): void {
    this.view = 'administration';
    if (this.canManageRoom) this.api.getGroups().subscribe({ next: data => this.groups = data, error: () => this.error = 'دریافت گروه‌های Mention انجام نشد.' });
    if (this.canManageIntegration) this.api.getIntegrations().subscribe({ next: data => this.integrations = data, error: () => this.error = 'دریافت Integrationها انجام نشد.' });
  }

  addMember(): void {
    if (!this.selectedRoom || !this.newMember.subject.trim()) return;
    const personInfoRef = Number(this.newMember.personInfoRef);
    this.api.addMember(this.selectedRoom.roomCode, {
      subject: this.newMember.subject.trim(),
      ...(Number.isInteger(personInfoRef) && personInfoRef > 0 ? { personInfoRef } : {}),
      memberRole: this.newMember.memberRole
    }).subscribe({
      next: () => {
        this.newMember = { subject: '', personInfoRef: '', memberRole: 'Member' };
        this.notification.success('عضو اتاق ثبت شد.');
      },
      error: () => this.error = 'افزودن عضو به اتاق انجام نشد.'
    });
  }

  createGroup(): void {
    const memberSubjects = [...new Set(this.newGroup.memberSubjects)];
    if (!this.newGroup.groupKey.trim() || !this.newGroup.title.trim() || !memberSubjects.length) return;
    this.api.createGroup({
      groupKey: this.newGroup.groupKey.trim(),
      title: this.newGroup.title.trim(),
      memberSubjects
    }).subscribe({
      next: () => {
        this.newGroup = { groupKey: '', title: '', memberSubjects: [] };
        this.showAdministration();
      },
      error: () => this.error = 'ایجاد گروه Mention انجام نشد.'
    });
  }

  createIntegration(): void {
    if (!this.selectedRoom || !this.newIntegration.title.trim() || !this.newIntegration.eventPattern.trim()) return;
    this.api.createIntegration({
      title: this.newIntegration.title.trim(),
      eventPattern: this.newIntegration.eventPattern.trim(),
      targetRoomRef: this.selectedRoom.roomCode,
      ...(this.newIntegration.webhookUrl.trim() ? { webhookUrl: this.newIntegration.webhookUrl.trim() } : {})
    }).subscribe({
      next: () => {
        this.newIntegration = { title: '', eventPattern: '', webhookUrl: '' };
        this.showAdministration();
      },
      error: () => this.error = 'ایجاد Integration انجام نشد؛ HTTPS و allow-list را بررسی کنید.'
    });
  }

  onTyping(): void { if (this.selectedRoom) void this.realtime.typing(this.selectedRoom.roomCode, !!this.message); }
  trackRoom = (_: number, item: CollaborationRoom) => item.roomCode;
  trackPost = (_: number, item: CollaborationPost) => item.postCode;

  private resetComposer(): void {
    this.message = ''; this.priority = 'Standard'; this.requireAcknowledgement = false;
    this.scheduledFor = ''; this.mentionSubjects = []; this.mentionGroups = []; this.pendingFile = undefined;
    if (this.selectedRoom) void this.realtime.typing(this.selectedRoom.roomCode, false);
  }

  private allowed(permission: string): boolean { return this.permissions.isAdmin || this.permissions.hasPermission('Collaboration.Admin') || this.permissions.hasPermission(permission); }
}
