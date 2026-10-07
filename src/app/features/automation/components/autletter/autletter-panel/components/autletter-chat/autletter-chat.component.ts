import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
import { AutletterFileUploadComponent } from '../autletter-file-upload/autletter-file-upload.component';
import {
  AutletterRealtimeService,
  ConversationChangedEvent,
  SeenChangedEvent,
  TicketUnreadChangedEvent,
  TypingChangedEvent,
  OnlineTicketUser,
  TicketPresenceChangedEvent
} from 'src/app/features/automation/services/autletter-realtime.service';

interface SeenUser {
  CentralRef: number;
  UserRef: number;
  DisplayName: string;
  LastSeenDate: string;
}

interface AuditItem {
  AuditCode: number;
  ActionType: 'EDIT' | 'DELETE' | string;
  OldConversationText: string;
  NewConversationText: string;
  ActorName: string;
  ActorCentralRef: number;
  ActorUserRef: number | null;
  ActionDate: string;
}

interface ChatMessage {
  Id: number;
  ConversationCode: number;
  CentralRef: number;
  UserRef: number;
  ConversationText: string;
  CreationDate: string;
  Name: string;
  ClassName: string;
  IsMine: boolean;
  ReplyToConversationRef: number | null;
  ReplyText: string;
  ReplyName: string;
  IsEdited: boolean;
  IsDeleted: boolean;
  SeenByOthers: boolean;
  SeenCount: number;
  SeenBy: SeenUser[];
}

interface PreviewState {
  url: string;
  safeUrl: SafeResourceUrl;
  fileName: string;
  contentType: string;
  kind: 'image' | 'audio' | 'video' | 'pdf' | 'other';
}

interface InlineFilePreview {
  url: string;
  fileName: string;
  contentType: string;
  kind: PreviewState['kind'];
}

interface AudioPlaybackState {
  currentTime: number;
  duration: number;
  playing: boolean;
}

interface PendingVoicePreview {
  url: string;
  base64: string;
  fileName: string;
  fileType: string;
  mimeType: string;
}

@Component({
  selector: 'app-autletter-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutletterFileUploadComponent],
  templateUrl: './autletter-chat.component.html',
  styleUrl: './autletter-chat.component.scss'
})
export class AutletterChatComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() ObjectRef = '';
  @Input() LetterState = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;

  private readonly repo = inject(AutletterWebApiService);
  private readonly realtime = inject(AutletterRealtimeService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly session = inject(SessionStorageService);

  msgs = signal<ChatMessage[]>([]);
  searchText = signal('');
  loading = signal(false);
  ShowInsertRow = signal(false);
  LetterRef = signal('');
  CentralRef = signal('');
  State = signal('');

  replyTo = signal<ChatMessage | null>(null);
  editingMessage = signal<ChatMessage | null>(null);
  preview = signal<PreviewState | null>(null);
  inlineFilePreviews = signal<Record<number, InlineFilePreview>>({});
  audioPlaybackStates = signal<Record<number, AudioPlaybackState>>({});
  pendingVoice = signal<PendingVoicePreview | null>(null);

  connectionState = signal<'online' | 'connecting' | 'offline'>('offline');
  typingUsers = signal<Record<string, string>>({});
  onlineUsers = signal<OnlineTicketUser[]>([]);
  seenDetailsMessage = signal<ChatMessage | null>(null);
  auditMessage = signal<ChatMessage | null>(null);
  auditItems = signal<AuditItem[]>([]);
  auditLoading = signal(false);

  isDragging = signal(false);
  isRecording = signal(false);
  recordingSeconds = signal(0);

  readonly visibleMsgs = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    if (!q) return this.msgs();

    return this.msgs().filter(m =>
      `${m.ConversationText} ${m.Name} ${m.ReplyText}`.toLowerCase().includes(q)
    );
  });

  readonly typingText = computed(() => {
    const names = Object.values(this.typingUsers());
    if (!names.length) return '';
    if (names.length === 1) return `${names[0]} در حال نوشتن است...`;
    return `${names.slice(0, 2).join(' و ')} در حال نوشتن هستند...`;
  });

  MessageForm = new FormGroup({
    Description: new FormControl(''),
    LetterRef: new FormControl(''),
    CentralRef: new FormControl('')
  });

  EditForm_Attach = new FormGroup({
    Title: new FormControl(''),
    PixelScale: new FormControl('1000'),
    ClassName: new FormControl('Aut'),
    ObjectRef: new FormControl(''),
    ConversationRef: new FormControl('')
  });

  FileForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl('Aut'),
    FileType: new FormControl(''),
    FilePath: new FormControl(''),
    File: new FormControl(''),
    Type: new FormControl(''),
    LetterRef: new FormControl(''),
    CentralRef: new FormControl(''),
    UserRef: new FormControl('')
  });

  private subscriptions = new Subscription();
  private initialized = false;
  private typingTimer?: ReturnType<typeof setTimeout>;
  private lastMarkedSeenCode = 0;

  private mediaRecorder?: MediaRecorder;
  private readonly inlinePreviewLoading = new Set<number>();
  private activeAudio?: HTMLAudioElement;
  private activeAudioCode: number | null = null;
  private mediaStream?: MediaStream;
  private audioChunks: Blob[] = [];
  private recordingTimer?: ReturnType<typeof setInterval>;
  private cancelCurrentRecording = false;

  private readonly visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      this.markSeen();
    }
  };

  ngOnInit(): void {
    this.LetterRef.set(this.ObjectRef ?? '');
    this.CentralRef.set(String(this.session.centralRef ?? ''));
    this.State.set(this.LetterState ?? '');

    const userType = this.session.getString('UserType') || '';
    this.ShowInsertRow.set(
      ['1274', '1139', '1843'].includes(this.CentralRef()) || userType === 'admin'
    );

    this.patchRefs();
    this.bindRealtime();
    document.addEventListener('visibilitychange', this.visibilityHandler);

    void this.openRealtimeTicket();

    this.GetAutConversation(true);
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['LetterState']) {
      this.State.set(this.LetterState ?? '');
    }

    if (changes['ObjectRef']) {
      const oldLetter = Number(this.LetterRef());
      const newLetter = Number(this.ObjectRef ?? '0');
      this.LetterRef.set(this.ObjectRef ?? '');
      this.lastMarkedSeenCode = 0;
      this.patchRefs();

      if (this.initialized && oldLetter !== newLetter) {
        if (oldLetter > 0) void this.realtime.leaveTicket(oldLetter);
        if (newLetter > 0) void this.openRealtimeTicket();
        this.GetAutConversation(true);
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngOnDestroy(): void {
    const letterRef = Number(this.LetterRef());
    if (letterRef > 0) void this.realtime.leaveTicket(letterRef);

    this.subscriptions.unsubscribe();
    document.removeEventListener('visibilitychange', this.visibilityHandler);

    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.stopRecordingTimersAndTracks();
    this.closePreview();
    this.revokeInlinePreviews();
    this.cancelPendingVoice();
    this.activeAudio?.pause();
    this.activeAudio = undefined;
    this.activeAudioCode = null;
  }

  canInsertMessage(): boolean {
    const state = (this.State() ?? '').trim();
    return state !== 'تمام شده' || this.ShowInsertRow();
  }

  refreshChat(): void {
    this.GetAutConversation(false);
  }

  private patchRefs(): void {
    this.MessageForm.patchValue({
      LetterRef: this.LetterRef(),
      CentralRef: this.CentralRef()
    });

    this.FileForm.patchValue({
      LetterRef: this.LetterRef(),
      CentralRef: this.CentralRef(),
      UserRef: String(this.currentUserRef())
    });
  }

  private bindRealtime(): void {
    this.subscriptions.add(
      this.realtime.state$.subscribe(state => {
        const value = String(state);
        if (value === 'Connected') this.connectionState.set('online');
        else if (value === 'Connecting' || value === 'Reconnecting') {
          this.connectionState.set('connecting');
        } else this.connectionState.set('offline');
      })
    );

    this.subscriptions.add(
      this.realtime.conversationChanged$.subscribe((event: ConversationChangedEvent) => {
        if (event.LetterRef !== Number(this.LetterRef())) return;

        // IMPORTANT: no full conversation refresh. SignalR carries the changed row itself.
        if (event.Message) {
          this.upsertMessage(this.mapMessage(event.Message), event.EventType === 'insert');
        } else {
          // Backward-compatible fallback for an older server payload.
          this.GetAutConversation(event.EventType === 'insert');
        }
      })
    );

    this.subscriptions.add(
      this.realtime.seenChanged$.subscribe((event: SeenChangedEvent) => {
        if (event.LetterRef !== Number(this.LetterRef())) return;
        if (!event.LastSeenConversationCode) return;

        this.msgs.update(items => items.map(m => {
          if (m.ConversationCode > event.LastSeenConversationCode!) return m;
          if (m.CentralRef === event.CentralRef && m.UserRef === event.UserRef) return m;

          const exists = m.SeenBy.some(x =>
            x.CentralRef === event.CentralRef && x.UserRef === event.UserRef
          );

          const seenBy = exists ? m.SeenBy : [...m.SeenBy, {
            CentralRef: event.CentralRef,
            UserRef: event.UserRef,
            DisplayName: event.DisplayName,
            LastSeenDate: event.LastSeenDate ?? ''
          }];

          return {
            ...m,
            SeenBy: seenBy,
            SeenCount: seenBy.length,
            SeenByOthers: seenBy.length > 0
          };
        }));
      })
    );

    this.subscriptions.add(
      this.realtime.typingChanged$.subscribe((event: TypingChangedEvent) => {
        if (event.LetterRef !== Number(this.LetterRef())) return;
        if (event.CentralRef === Number(this.CentralRef()) &&
          event.UserRef === this.currentUserRef()) return;

        this.typingUsers.update(current => {
          const next = { ...current };
          const key = `${event.CentralRef}:${event.UserRef}`;
          if (event.IsTyping) next[key] = event.DisplayName || 'کاربر';
          else delete next[key];
          return next;
        });
      })
    );

    this.subscriptions.add(
      this.realtime.ticketUnreadChanged$.subscribe((event: TicketUnreadChangedEvent) => {
        if (event.SenderCentralRef === Number(this.CentralRef()) &&
          (event.SenderUserRef == null || event.SenderUserRef === this.currentUserRef())) return;

        const isCurrentTicket = event.LetterRef === Number(this.LetterRef());
        if (!isCurrentTicket || document.visibilityState !== 'visible') {
          this.showBrowserNotification(event.LetterRef);
        }
      })
    );

    this.subscriptions.add(
      this.realtime.presenceChanged$.subscribe((event: TicketPresenceChangedEvent) => {
        if (event.LetterRef !== Number(this.LetterRef())) return;
        this.onlineUsers.set(event.Users);
      })
    );
  }

  GetAutConversation(scrollAfter = false): void {
    const letterRef = this.LetterRef();
    const centralRef = this.CentralRef();
    if (!letterRef || !centralRef) return;

    this.loading.set(true);

    this.repo.GetAutConversationV2(letterRef, centralRef).subscribe({
      next: (res: any) => {
        const list = res?.Conversations ?? res ?? [];

        this.msgs.set((Array.isArray(list) ? list : []).map((m: any) => this.mapMessage(m)));
        this.prefetchInlineFilePreviews();
        this.loading.set(false);
        this.cdr.detectChanges();

        if (scrollAfter) {
          setTimeout(() => this.scrollToBottom(), 30);
        }

        if (document.visibilityState === 'visible') {
          this.markSeen();
        }
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('خطا در دریافت پیام‌ها');
      }
    });
  }

  private mapMessage(m: any): ChatMessage {
    const value = (pascal: string, camel: string) => m?.[pascal] ?? m?.[camel];

    const centralRef = Number(value('CentralRef', 'centralRef') ?? 0);
    const userRef = Number(value('UserRef', 'userRef') ?? 0);
    const className = String(value('ClassName', 'className') ?? '').trim() || 'Text';
    const myCentralRef = Number(this.CentralRef());
    const myUserRef = this.currentUserRef();

    // Historical rows may have UserRef=NULL/0. For those rows CentralRef is the best available owner.
    // New rows use both CentralRef + UserRef, so two users under the same Central cannot edit each other.
    const isMine = centralRef === myCentralRef && (userRef <= 0 || userRef === myUserRef);

    const replyRef = value('ReplyToConversationRef', 'replyToConversationRef');

    return {
      Id: Number(value('ConversationCode', 'conversationCode') ?? 0),
      ConversationCode: Number(value('ConversationCode', 'conversationCode') ?? 0),
      CentralRef: centralRef,
      UserRef: userRef,
      ConversationText: String(value('ConversationText', 'conversationText') ?? ''),
      CreationDate: String(value('CreationDate', 'creationDate') ?? ''),
      Name: String(value('Name', 'name') ?? ''),
      ClassName: className,
      IsMine: isMine,
      ReplyToConversationRef: replyRef ? Number(replyRef) : null,
      ReplyText: String(value('ReplyText', 'replyText') ?? ''),
      ReplyName: String(value('ReplyName', 'replyName') ?? ''),
      IsEdited: this.toBool(value('IsEdited', 'isEdited')),
      IsDeleted: this.toBool(value('IsDeleted', 'isDeleted')),
      SeenByOthers: this.toBool(value('SeenByOthers', 'seenByOthers')),
      SeenCount: Number(value('SeenCount', 'seenCount') ?? 0),
      SeenBy: this.parseSeenUsers(value('SeenByJson', 'seenByJson'))
    };
  }

  private markSeen(): void {
    const lastCode = this.msgs().reduce(
      (max, item) => Math.max(max, item.ConversationCode),
      0
    );

    if (!lastCode || lastCode === this.lastMarkedSeenCode) return;

    this.repo.ConversationSeenV2({
      LetterRef: Number(this.LetterRef()),
      CentralRef: Number(this.CentralRef()),
      UserRef: this.currentUserRef(),
      DisplayName: this.currentDisplayName()
    }).subscribe({
      next: () => this.lastMarkedSeenCode = lastCode
    });
  }

  onEnterPress(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) return;
    keyboardEvent.preventDefault();
    this.SendMessage();
  }

  onMessageInput(): void {
    const text = this.MessageForm.controls.Description.value?.trim() ?? '';
    const letterRef = Number(this.LetterRef());
    if (!letterRef) return;

    void this.realtime.setTyping(letterRef, !!text);

    if (this.typingTimer) clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      void this.realtime.setTyping(letterRef, false);
    }, 1200);
  }

  SendMessage(): void {
    const desc = this.MessageForm.controls.Description.value?.trim() ?? '';
    if (!desc) {
      this.notificationService.warning('متن پیام نباید خالی باشد');
      return;
    }

    const editing = this.editingMessage();
    if (editing) {
      this.repo.Conversation_Edit({
        ConversationCode: editing.ConversationCode,
        CentralRef: Number(this.CentralRef()),
        UserRef: this.currentUserRef(),
        ActorName: this.currentDisplayName(),
        ConversationText: desc
      }).subscribe({
        next: (res: any) => {
          const row = this.firstConversation(res);
          if (row) this.upsertMessage(this.mapMessage(row), false);
          this.MessageForm.controls.Description.setValue('');
          this.editingMessage.set(null);
        },
        error: () => this.notificationService.error('ویرایش پیام انجام نشد')
      });
      return;
    }

    this.repo.Conversation_InsertV2({
      LetterRef: Number(this.LetterRef()),
      CentralRef: Number(this.CentralRef()),
      UserRef: this.readSessionInt('UserId'),
      ConversationText: desc,
      ClassName: 'Text',
      ReplyToConversationRef: this.replyTo()?.ConversationCode ?? null,
      IsInternal: false
    }).subscribe({
      next: (res: any) => {
        // Sender sees the message immediately even if SignalR reconnects at this exact moment.
        const row = this.firstConversation(res);
        if (row) this.upsertMessage(this.mapMessage(row), true);
        this.MessageForm.controls.Description.setValue('');
        this.replyTo.set(null);
        this.onMessageInput();
      },
      error: () => this.notificationService.error('ارسال پیام با خطا مواجه شد')
    });
  }

  setReply(msg: ChatMessage): void {
    if (msg.IsDeleted) return;
    this.editingMessage.set(null);
    this.replyTo.set(msg);
    setTimeout(() => {
      const el = document.querySelector<HTMLTextAreaElement>('.kws-chat-input');
      el?.focus();
    });
  }

  cancelReply(): void {
    this.replyTo.set(null);
  }

  formatMessageDate(value: string): string {
    if (!value) return '';
    try {
      const d = new Date(value);
      const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).formatToParts(d);
      const get = (t: string) => parts.find(x => x.type === t)?.value ?? '';
      return `${get('year')}/${get('month')}/${get('day')} ${get('hour')}:${get('minute')}`;
    } catch {
      return value;
    }
  }

  startEdit(msg: ChatMessage): void {
    if (!msg.IsMine || msg.IsDeleted || msg.ClassName !== 'Text') return;
    this.replyTo.set(null);
    this.editingMessage.set(msg);
    this.MessageForm.controls.Description.setValue(msg.ConversationText);
  }

  cancelEdit(): void {
    this.editingMessage.set(null);
    this.MessageForm.controls.Description.setValue('');
  }

  deleteMessage(msg: ChatMessage): void {
    if (!msg.IsMine || msg.IsDeleted) return;
    if (!window.confirm('این پیام حذف شود؟')) return;

    this.repo.Conversation_Delete({
      ConversationCode: msg.ConversationCode,
      CentralRef: Number(this.CentralRef()),
      UserRef: this.currentUserRef(),
      ActorName: this.currentDisplayName()
    }).subscribe({
      next: (res: any) => {
        const row = this.firstConversation(res);
        if (row) this.upsertMessage(this.mapMessage(row), false);
      },
      error: () => this.notificationService.error('حذف پیام انجام نشد')
    });
  }

  scrollToMessage(conversationCode: number): void {
    document.getElementById(`chat-msg-${conversationCode}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  onFileReadyForUpload(payload: {
    Title: string;
    FileName: string;
    ObjectRef: string;
    ClassName: string;
    Type: string;
    FilePath: string;
    FileType: string;
    File: string;
  }): void {
    this.FileForm.patchValue({
      ...payload,
      LetterRef: this.LetterRef(),
      CentralRef: this.CentralRef()
    });

    this.UploadFile();
  }

  UploadFile(onSuccess?: () => void): void {
    this.repo.Conversation_UploadFile(this.FileForm.value).subscribe({
      next: () => {
        // With SignalR online, ConversationChanged adds the file row without reloading the chat.
        if (this.connectionState() !== 'online') this.GetAutConversation(true);
        onSuccess?.();
      },
      error: () => this.notificationService.error('خطا در ارسال فایل')
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const files = Array.from(event.dataTransfer?.files ?? []);
    files.forEach(file => this.uploadBrowserFile(file));
  }

  onPaste(event: ClipboardEvent): void {
    const files = Array.from(event.clipboardData?.files ?? []);
    if (!files.length) return;

    event.preventDefault();
    files.forEach(file => this.uploadBrowserFile(file));
  }

  private uploadBrowserFile(file: File): void {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result ?? '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      const dot = file.name.lastIndexOf('.');
      const extension = dot >= 0 ? file.name.substring(dot + 1).toLowerCase() : 'bin';
      const baseName = dot >= 0 ? file.name.substring(0, dot) : file.name;

      this.FileForm.patchValue({
        Title: file.name,
        FileName: baseName,
        ObjectRef: '0',
        ClassName: 'Aut',
        Type: file.type || extension,
        FilePath: '',
        FileType: extension,
        File: base64,
        LetterRef: this.LetterRef(),
        CentralRef: this.CentralRef()
      });

      this.UploadFile();
    };

    reader.onerror = () => this.notificationService.error('خواندن فایل انجام نشد');
    reader.readAsDataURL(file);
  }

  openFile(msg: ChatMessage): void {
    this.repo.GetConversationFileFromAttach(this.buildAttachRequest(msg)).subscribe({
      next: (data: any) => {
        const base64 = data?.text ?? data?.Text;
        const contentType = String(data?.contentType ?? data?.ContentType ?? 'application/octet-stream');
        const fileName = String(data?.fileName ?? data?.FileName ?? 'file');

        if (!base64) {
          this.notificationService.error('فایل نامعتبر است');
          return;
        }

        this.closePreview();
        const blob = this.base64ToBlob(base64, contentType);
        const url = URL.createObjectURL(blob);

        this.preview.set({
          url,
          safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url),
          fileName,
          contentType,
          kind: this.detectPreviewKind(contentType, fileName)
        });
      },
      error: () => this.notificationService.error('خطا در دریافت فایل')
    });
  }

  hasInlineImagePreview(msg: ChatMessage): boolean {
    return this.inlineFilePreviews()[msg.ConversationCode]?.kind === 'image';
  }

  getInlineImageUrl(msg: ChatMessage): string {
    return this.inlineFilePreviews()[msg.ConversationCode]?.url ?? '';
  }

  hasInlineAudioPreview(msg: ChatMessage): boolean {
    return this.inlineFilePreviews()[msg.ConversationCode]?.kind === 'audio';
  }

  getInlineAudioUrl(msg: ChatMessage): string {
    return this.inlineFilePreviews()[msg.ConversationCode]?.url ?? '';
  }

  getAudioState(msg: ChatMessage): AudioPlaybackState {
    return this.audioPlaybackStates()[msg.ConversationCode] ?? {
      currentTime: 0,
      duration: 0,
      playing: false
    };
  }

  onAudioLoaded(msg: ChatMessage, audio: HTMLAudioElement): void {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    this.updateAudioState(msg.ConversationCode, { duration });
  }

  onAudioTimeUpdate(msg: ChatMessage, audio: HTMLAudioElement): void {
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    const duration = Number.isFinite(audio.duration) ? audio.duration : this.getAudioState(msg).duration;
    this.updateAudioState(msg.ConversationCode, { currentTime, duration });
  }

  onAudioEnded(msg: ChatMessage): void {
    this.updateAudioState(msg.ConversationCode, { playing: false });
    if (this.activeAudioCode === msg.ConversationCode) {
      this.activeAudio = undefined;
      this.activeAudioCode = null;
    }
  }

  toggleInlineAudio(msg: ChatMessage, audio: HTMLAudioElement): void {
    if (audio.paused) {
      if (this.activeAudio && this.activeAudio !== audio) {
        this.activeAudio.pause();
        if (this.activeAudioCode != null) {
          this.updateAudioState(this.activeAudioCode, { playing: false });
        }
      }

      audio.play().then(() => {
        this.activeAudio = audio;
        this.activeAudioCode = msg.ConversationCode;
        this.updateAudioState(msg.ConversationCode, { playing: true });
      }).catch(() => {
        this.notificationService.error('پخش فایل صوتی انجام نشد');
      });
      return;
    }

    audio.pause();
    this.updateAudioState(msg.ConversationCode, { playing: false });
  }

  seekInlineAudio(msg: ChatMessage, audio: HTMLAudioElement, rawValue: string | number): void {
    const value = Number(rawValue);
    if (!Number.isFinite(value)) return;

    const duration = Number.isFinite(audio.duration) ? audio.duration : this.getAudioState(msg).duration;
    const next = Math.max(0, Math.min(value, duration || value));
    audio.currentTime = next;
    this.updateAudioState(msg.ConversationCode, { currentTime: next });
  }

  formatAudioTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const minutes = Math.floor(total / 60);
    const remain = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remain).padStart(2, '0')}`;
  }

  private updateAudioState(code: number, patch: Partial<AudioPlaybackState>): void {
    this.audioPlaybackStates.update(states => {
      const current = states[code] ?? { currentTime: 0, duration: 0, playing: false };
      return {
        ...states,
        [code]: { ...current, ...patch }
      };
    });
  }

  getFileDisplayName(msg: ChatMessage): string {
    return this.inlineFilePreviews()[msg.ConversationCode]?.fileName || msg.ConversationText || 'نمایش فایل';
  }

  private prefetchInlineFilePreviews(): void {
    this.msgs()
      .filter(msg => msg.ClassName === 'File' && !msg.IsDeleted)
      .forEach(msg => this.ensureInlineFilePreview(msg));
  }

  private ensureInlineFilePreview(msg: ChatMessage): void {
    const code = msg.ConversationCode;
    if (!code || this.inlineFilePreviews()[code] || this.inlinePreviewLoading.has(code)) return;

    this.inlinePreviewLoading.add(code);

    this.repo.GetConversationFileFromAttach(this.buildAttachRequest(msg)).subscribe({
      next: (data: any) => {
        this.inlinePreviewLoading.delete(code);

        const base64 = data?.text ?? data?.Text;
        const contentType = String(data?.contentType ?? data?.ContentType ?? 'application/octet-stream');
        const fileName = String(data?.fileName ?? data?.FileName ?? msg.ConversationText ?? 'file');

        if (!base64) return;

        const kind = this.detectPreviewKind(contentType, fileName);
        const blob = this.base64ToBlob(base64, contentType);
        const url = URL.createObjectURL(blob);

        this.inlineFilePreviews.update(items => {
          const existing = items[code];
          if (existing?.url && existing.url !== url) URL.revokeObjectURL(existing.url);

          return {
            ...items,
            [code]: {
              url,
              fileName,
              contentType,
              kind
            }
          };
        });
      },
      error: () => {
        this.inlinePreviewLoading.delete(code);
      }
    });
  }

  private buildAttachRequest(msg: ChatMessage) {
    return {
      Title: msg.ConversationText,
      PixelScale: '1000',
      ClassName: 'Aut',
      ObjectRef: this.LetterRef(),
      ConversationRef: String(msg.ConversationCode)
    };
  }

  private revokeInlinePreviews(): void {
    this.activeAudio?.pause();
    this.activeAudio = undefined;
    this.activeAudioCode = null;

    const current = this.inlineFilePreviews();
    Object.values(current).forEach(item => {
      if (item?.url) URL.revokeObjectURL(item.url);
    });
    this.inlineFilePreviews.set({});
    this.audioPlaybackStates.set({});
    this.inlinePreviewLoading.clear();
  }

  closePreview(): void {
    const current = this.preview();
    if (current?.url) URL.revokeObjectURL(current.url);
    this.preview.set(null);
  }

  downloadPreview(): void {
    const current = this.preview();
    if (!current) return;

    const a = document.createElement('a');
    a.href = current.url;
    a.download = current.fileName;
    a.click();
  }

  private detectPreviewKind(contentType: string, fileName = ''): PreviewState['kind'] {
    const normalizedType = (contentType || '').toLowerCase();
    const ext = (fileName.split('.').pop() || '').toLowerCase();

    if (normalizedType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (normalizedType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(ext)) return 'audio';
    if (normalizedType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (normalizedType === 'application/pdf' || ext === 'pdf') return 'pdf';
    return 'other';
  }

  private base64ToBlob(base64: string, fileType: string): Blob {
    const bytes = atob(base64);
    const numbers = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) numbers[i] = bytes.charCodeAt(i);
    return new Blob([numbers], { type: fileType });
  }

  async startRecording(): Promise<void> {
    if (this.isRecording()) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.cancelCurrentRecording = false;

      const mimeType = this.pickRecordingMimeType();
      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        const canceled = this.cancelCurrentRecording;
        const actualMime = this.mediaRecorder?.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: actualMime });
        this.stopRecordingTimersAndTracks();

        if (canceled || blob.size === 0) return;

        const base64 = await this.blobToBase64(blob);
        const extension = actualMime.includes('mp4') ? 'm4a' : 'webm';

        this.cancelPendingVoice();
        this.pendingVoice.set({
          url: URL.createObjectURL(blob),
          base64,
          fileName: `voice_${Date.now()}`,
          fileType: extension,
          mimeType: actualMime
        });
      };

      this.mediaRecorder.start(250);
      this.isRecording.set(true);
      this.recordingSeconds.set(0);
      this.recordingTimer = setInterval(
        () => this.recordingSeconds.update(x => x + 1),
        1000
      );
    } catch {
      this.notificationService.error('دسترسی میکروفن داده نشد');
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;
    this.cancelCurrentRecording = false;
    this.mediaRecorder.stop();
  }

  cancelRecording(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return;
    this.cancelCurrentRecording = true;
    this.mediaRecorder.stop();
  }

  sendPendingVoice(): void {
    const voice = this.pendingVoice();
    if (!voice) return;

    this.FileForm.patchValue({
      Title: 'Voice',
      FileName: voice.fileName,
      ObjectRef: '0',
      ClassName: 'Aut',
      Type: 'voice',
      FilePath: '',
      FileType: voice.fileType,
      File: voice.base64,
      LetterRef: this.LetterRef(),
      CentralRef: this.CentralRef(),
      UserRef: String(this.currentUserRef())
    });

    this.UploadFile(() => this.cancelPendingVoice());
  }

  cancelPendingVoice(): void {
    const voice = this.pendingVoice();
    if (voice?.url) URL.revokeObjectURL(voice.url);
    this.pendingVoice.set(null);
  }

  private stopRecordingTimersAndTracks(): void {
    this.isRecording.set(false);
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    this.recordingTimer = undefined;
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = undefined;
  }

  private pickRecordingMimeType(): string {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4'
    ];

    return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? '';
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = String(reader.result ?? '');
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async enableBrowserNotifications(): Promise<void> {
    if (!('Notification' in window)) {
      this.notificationService.warning('مرورگر شما Notification را پشتیبانی نمی‌کند');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // permission is now active
    }
  }

  private showBrowserNotification(letterRef: number): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const notification = new Notification(`پیام جدید تیکت #${letterRef}`, {
      body: 'یک پیام جدید برای این تیکت ثبت شد.'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }


  private async openRealtimeTicket(): Promise<void> {
    const letterRef = Number(this.LetterRef());
    const centralRef = Number(this.CentralRef());
    if (!letterRef || !centralRef) return;

    try {
      await this.realtime.openTicket(letterRef);
    } catch {
      // REST still works; realtime service will retry on reconnect.
    }
  }

  private currentUserRef(): number {
    const loginType = (this.session.getString('LoginType') || '').toUpperCase();

    if (loginType === 'CUSTOMER') {
      return this.readSessionInt('XUserCode') ??
        this.readSessionInt('PersonInfoRef') ??
        0;
    }

    return this.readSessionInt('UserId') ??
      this.readSessionInt('OldUserId') ??
      this.readSessionInt('UserIdRef') ??
      this.readSessionInt('PersonInfoRef') ??
      0;
  }

  private currentDisplayName(): string {
    return this.session.getString('PhFullName') ||
      this.session.getString('DisplayName') ||
      this.session.getString('UserPrintName') ||
      this.session.getString('UserName') ||
      'کاربر';
  }

  private parseSeenUsers(raw: any): SeenUser[] {
    try {
      const data = Array.isArray(raw) ? raw : JSON.parse(String(raw || '[]'));
      return (Array.isArray(data) ? data : []).map((x: any) => ({
        CentralRef: Number(x.CentralRef ?? x.centralRef ?? 0),
        UserRef: Number(x.UserRef ?? x.userRef ?? 0),
        DisplayName: String(x.DisplayName ?? x.displayName ?? 'کاربر'),
        LastSeenDate: String(x.LastSeenDate ?? x.lastSeenDate ?? '')
      }));
    } catch {
      return [];
    }
  }

  private firstConversation(res: any): any | null {
    const list = res?.Conversations ?? res?.conversations ?? res;
    if (Array.isArray(list)) return list[0] ?? null;
    return list && typeof list === 'object' ? list : null;
  }

  private upsertMessage(message: ChatMessage, scrollAfter: boolean): void {
    if (message.ClassName === 'File' && !message.IsDeleted) {
      this.ensureInlineFilePreview(message);
    }
    this.msgs.update(items => {
      const index = items.findIndex(x => x.ConversationCode === message.ConversationCode);
      if (index < 0) {
        return [...items, message].sort((a, b) => a.ConversationCode - b.ConversationCode);
      }
      const next = [...items];
      next[index] = message;
      return next;
    });

    this.cdr.detectChanges();
    if (scrollAfter) setTimeout(() => this.scrollToBottom(), 20);
    if (document.visibilityState === 'visible') this.markSeen();
  }

  toggleSeenDetails(msg: ChatMessage): void {
    this.seenDetailsMessage.set(
      this.seenDetailsMessage()?.ConversationCode === msg.ConversationCode ? null : msg
    );
  }

  openAudit(msg: ChatMessage): void {
    this.auditMessage.set(msg);
    this.auditItems.set([]);
    this.auditLoading.set(true);

    this.repo.GetConversationAudit(msg.ConversationCode).subscribe({
      next: (res: any) => {
        const list = res?.Audit ?? res?.audit ?? res ?? [];
        this.auditItems.set((Array.isArray(list) ? list : []).map((x: any) => ({
          AuditCode: Number(x.AuditCode ?? 0),
          ActionType: String(x.ActionType ?? ''),
          OldConversationText: String(x.OldConversationText ?? ''),
          NewConversationText: String(x.NewConversationText ?? ''),
          ActorName: String(x.ActorName ?? 'کاربر'),
          ActorCentralRef: Number(x.ActorCentralRef ?? 0),
          ActorUserRef: x.ActorUserRef == null ? null : Number(x.ActorUserRef),
          ActionDate: String(x.ActionDate ?? '')
        })));
        this.auditLoading.set(false);
      },
      error: () => {
        this.auditLoading.set(false);
        this.notificationService.error('دریافت سوابق پیام انجام نشد');
      }
    });
  }

  closeAudit(): void {
    this.auditMessage.set(null);
    this.auditItems.set([]);
  }


  private toBool(value: any): boolean {
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }

  private readSessionInt(key: string): number | null {
    const raw = this.session.getString(key);
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { }
  }
}
