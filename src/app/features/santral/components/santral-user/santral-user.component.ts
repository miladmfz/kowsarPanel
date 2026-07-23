import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { SantralWebApiService } from '../../services/santralapi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

interface SantralExtensionUser {
  extension: string;
  display_name: string;
  user_name: string;
  device_description: string;
  tech: string;
  dial: string;
  devicetype: string;
  device_user: string;
  voicemail: string;
  ringtimer?: string | number;
  password?: string;
  recording: string;
  outboundcid: string;
  noanswer_dest: string;
  busy_dest: string;
  chanunavail_dest: string;
}

type ForwardMode = 'all' | 'busy' | 'unavailable';

interface ForwardingItem {
  family: string;
  title: string;
  active: number;
  target: string;
}

interface ForwardingStatus {
  all: ForwardingItem;
  busy: ForwardingItem;
  unavailable: ForwardingItem;
}
type RecordingField =
  'in_external' |
  'in_internal' |
  'out_external' |
  'out_internal';

type RecordingMode = 'always' | 'never' | 'dontcare';

interface RecordingForm {
  in_external: RecordingMode;
  in_internal: RecordingMode;
  out_external: RecordingMode;
  out_internal: RecordingMode;
}

interface CallRecordingItem {
  extension: string;
  name: string;
  recording: {
    in_external: string;
    in_internal: string;
    out_external: string;
    out_internal: string;
    ondemand: string;
    priority: string;
  };
}

interface VoicemailForm {
  enabled: boolean;
  password: string;
  ringtimer: number;
  busy_to_voicemail: boolean;
}

interface CallRulesForm {
  allow_internal: boolean;
  allow_outbound: boolean;
  allow_external_inbound: boolean;
}
import { UserHeaderComponent } from './partials/user-header.component';
import { UserToolbarComponent } from './partials/user-toolbar.component';
import { UserGridCardComponent } from './partials/user-grid-card.component';
import { UserEditModalComponent } from './partials/user-edit-modal.component';
import { UserForwardModalComponent } from './partials/user-forward-modal.component';
import { UserRecordingModalComponent } from './partials/user-recording-modal.component';
import { UserVoicemailModalComponent } from './partials/user-voicemail-modal.component';
import { UserCallRulesModalComponent } from './partials/user-call-rules-modal.component';

@Component({
  selector: 'app-santral-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserHeaderComponent,
    UserToolbarComponent,
    UserGridCardComponent,
    UserEditModalComponent,
    UserForwardModalComponent,
    UserRecordingModalComponent,
    UserVoicemailModalComponent,
    UserCallRulesModalComponent
  ],
  templateUrl: './santral-user.component.html',
  styleUrls: ['./santral-user.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SantralUserComponent implements OnInit {

  readonly vm = this;

  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);


  recordingModalVisible = signal(false);
  recordingLoading = signal(false);
  recordingSaving = signal(false);

  recordingExtension = signal('');
  recordingDisplayName = signal('');

  recordingForm = signal<RecordingForm>({
    in_external: 'dontcare',
    in_internal: 'dontcare',
    out_external: 'dontcare',
    out_internal: 'dontcare'
  });

  recordingModeOptions: Array<{ value: RecordingMode; title: string }> = [
    { value: 'always', title: 'همیشه ضبط شود' },
    { value: 'never', title: 'هیچ‌وقت ضبط نشود' },
    { value: 'dontcare', title: 'طبق پیش‌فرض' }
  ];

  voicemailModalVisible = signal(false);
  voicemailLoading = signal(false);
  voicemailSaving = signal(false);

  voicemailExtension = signal('');
  voicemailDisplayName = signal('');

  voicemailForm = signal<VoicemailForm>({
    enabled: false,
    password: '',
    ringtimer: 20,
    busy_to_voicemail: true
  });

  voicemailMessagesLoading = signal(false);
  voicemailMessages = signal<any[]>([]);
  voicemailMessagesTab = signal<'new' | 'old'>('new');
  callRulesModalVisible = signal(false);
  callRulesLoading = signal(false);
  callRulesSaving = signal(false);

  callRulesExtension = signal('');
  callRulesDisplayName = signal('');

  callRulesForm = signal<CallRulesForm>({
    allow_internal: true,
    allow_outbound: true,
    allow_external_inbound: true
  });

  loading = signal(false);
  saving = signal(false);

  searchText = signal('');

  users = signal<SantralExtensionUser[]>([]);

  editModalVisible = signal(false);
  forwardModalVisible = signal(false);

  selectedUser = signal<SantralExtensionUser | null>(null);

  editForm = signal({
    extension: '',
    oldName: '',
    displayName: ''
  });

  forwardingLoading = signal(false);
  forwardingSaving = signal(false);

  forwardingExtension = signal('');
  forwardingDisplayName = signal('');

  forwardingStatus = signal<ForwardingStatus>({
    all: {
      family: 'CF',
      title: 'انتقال همه تماس‌ها',
      active: 0,
      target: ''
    },
    busy: {
      family: 'CFB',
      title: 'انتقال هنگام اشغال',
      active: 0,
      target: ''
    },
    unavailable: {
      family: 'CFU',
      title: 'انتقال هنگام عدم پاسخ / در دسترس نبودن',
      active: 0,
      target: ''
    }
  });

  forwardingForm = signal({
    allTarget: '',
    busyTarget: '',
    unavailableTarget: ''
  });

  filteredUsers = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    const list = this.users();

    if (!q) {
      return list;
    }

    return list.filter(item => {
      const text = [
        item.extension,
        item.display_name,
        item.user_name,
        item.device_description,
        item.tech,
        item.dial
      ].join(' ').toLowerCase();

      return text.includes(q);
    });
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    this.santralApi.GetSantralExtensionsForEdit()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت لیست داخلی‌ها');
            return;
          }

          const rows = Array.isArray(res?.extensions) ? res.extensions : [];
          this.users.set(rows);
        },
        error: (err: any) => {
          console.error('getSantralExtensionsForEdit error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  openEditModal(item: SantralExtensionUser): void {
    this.selectedUser.set(item);

    const currentName =
      item.display_name ||
      item.user_name ||
      item.device_description ||
      item.extension;

    this.editForm.set({
      extension: item.extension,
      oldName: currentName,
      displayName: currentName
    });

    this.editModalVisible.set(true);
  }

  closeEditModal(force = false): void {
    if (this.saving() && !force) {
      return;
    }

    this.editModalVisible.set(false);
    this.selectedUser.set(null);

    this.editForm.set({
      extension: '',
      oldName: '',
      displayName: ''
    });
  }

  onDisplayNameChange(value: string): void {
    this.editForm.update(form => ({
      ...form,
      displayName: value
    }));
  }

  saveUserName(): void {
    const form = this.editForm();

    const extension = String(form.extension || '').trim();
    const displayName = String(form.displayName || '').trim();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    if (!displayName) {
      this.notificationService.warning('نام داخلی را وارد کنید');
      return;
    }

    this.saving.set(true);

    this.santralApi.SaveSantralExtensionName(extension, displayName)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره نام داخلی ناموفق بود');
            return;
          }

          this.notificationService.success('نام داخلی با موفقیت ذخیره شد');

          this.closeEditModal(true);
          this.loadUsers();
        },
        error: (err: any) => {
          console.error('saveSantralExtensionName error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره نام داخلی';

          this.notificationService.error(msg);
        }
      });
  }

  openForwardModal(item: SantralExtensionUser): void {
    const currentName =
      item.display_name ||
      item.user_name ||
      item.device_description ||
      item.extension;

    this.selectedUser.set(item);
    this.forwardingExtension.set(item.extension);
    this.forwardingDisplayName.set(currentName);

    this.forwardModalVisible.set(true);

    this.loadForwardingStatus(item.extension);
  }

  closeForwardModal(force = false): void {
    if (this.forwardingSaving() && !force) {
      return;
    }

    this.forwardModalVisible.set(false);
    this.selectedUser.set(null);
    this.forwardingExtension.set('');
    this.forwardingDisplayName.set('');

    this.forwardingForm.set({
      allTarget: '',
      busyTarget: '',
      unavailableTarget: ''
    });
  }

  loadForwardingStatus(extension?: string): void {
    const ext = String(extension || this.forwardingExtension() || '').trim();

    if (!ext) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.forwardingLoading.set(true);

    this.santralApi.GetExtensionForwardingStatus(ext, false)
      .pipe(finalize(() => this.forwardingLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت وضعیت انتقال تماس');
            return;
          }

          const f = res?.forwarding || {};

          const status: ForwardingStatus = {
            all: {
              family: f?.all?.family || 'CF',
              title: f?.all?.title || 'انتقال همه تماس‌ها',
              active: Number(f?.all?.active || 0),
              target: String(f?.all?.target || '')
            },
            busy: {
              family: f?.busy?.family || 'CFB',
              title: f?.busy?.title || 'انتقال هنگام اشغال',
              active: Number(f?.busy?.active || 0),
              target: String(f?.busy?.target || '')
            },
            unavailable: {
              family: f?.unavailable?.family || 'CFU',
              title: f?.unavailable?.title || 'انتقال هنگام عدم پاسخ / در دسترس نبودن',
              active: Number(f?.unavailable?.active || 0),
              target: String(f?.unavailable?.target || '')
            }
          };

          this.forwardingStatus.set(status);

          this.forwardingForm.set({
            allTarget: status.all.target || '',
            busyTarget: status.busy.target || '',
            unavailableTarget: status.unavailable.target || ''
          });
        },
        error: (err: any) => {
          console.error('GetExtensionForwardingStatus error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  onForwardTargetChange(mode: ForwardMode, value: string): void {
    this.forwardingForm.update(form => {
      if (mode === 'all') {
        return {
          ...form,
          allTarget: value
        };
      }

      if (mode === 'busy') {
        return {
          ...form,
          busyTarget: value
        };
      }

      return {
        ...form,
        unavailableTarget: value
      };
    });
  }

  getForwardTarget(mode: ForwardMode): string {
    const form = this.forwardingForm();

    if (mode === 'all') {
      return form.allTarget;
    }

    if (mode === 'busy') {
      return form.busyTarget;
    }

    return form.unavailableTarget;
  }

  getForwardStatus(mode: ForwardMode): ForwardingItem {
    return this.forwardingStatus()[mode];
  }

  saveForwarding(mode: ForwardMode): void {
    const extension = String(this.forwardingExtension() || '').trim();
    const target = String(this.getForwardTarget(mode) || '').trim();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    if (!target) {
      this.notificationService.warning('مقصد انتقال تماس را وارد کنید');
      return;
    }

    if (!/^[0-9+]{2,30}$/.test(target)) {
      this.notificationService.warning('مقصد انتقال تماس نامعتبر است');
      return;
    }

    this.forwardingSaving.set(true);

    this.santralApi.SetExtensionForwarding(extension, mode, target, false)
      .pipe(finalize(() => this.forwardingSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره انتقال تماس ناموفق بود');
            return;
          }

          this.notificationService.success('انتقال تماس ذخیره شد');

          this.loadForwardingStatus(extension);
        },
        error: (err: any) => {
          console.error('SetExtensionForwarding error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره انتقال تماس';

          this.notificationService.error(msg);
        }
      });
  }

  clearForwarding(mode: ForwardMode): void {
    const extension = String(this.forwardingExtension() || '').trim();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    const status = this.getForwardStatus(mode);

    const ok = window.confirm(
      `آیا از غیرفعال کردن "${status.title}" برای داخلی ${extension} مطمئن هستید؟`
    );

    if (!ok) {
      return;
    }

    this.forwardingSaving.set(true);

    this.santralApi.ClearExtensionForwarding(extension, mode, false)
      .pipe(finalize(() => this.forwardingSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'غیرفعال کردن انتقال تماس ناموفق بود');
            return;
          }

          this.notificationService.success('انتقال تماس غیرفعال شد');

          this.loadForwardingStatus(extension);
        },
        error: (err: any) => {
          console.error('ClearExtensionForwarding error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در غیرفعال کردن انتقال تماس';

          this.notificationService.error(msg);
        }
      });
  }

  trackByExtension(index: number, item: SantralExtensionUser): string {
    return item.extension;
  }

  openRecordingModal(item: SantralExtensionUser): void {
    const currentName =
      item.display_name ||
      item.user_name ||
      item.device_description ||
      item.extension;

    this.selectedUser.set(item);
    this.recordingExtension.set(item.extension);
    this.recordingDisplayName.set(currentName);

    this.recordingForm.set({
      in_external: 'dontcare',
      in_internal: 'dontcare',
      out_external: 'dontcare',
      out_internal: 'dontcare'
    });

    this.recordingModalVisible.set(true);

    this.loadRecordingStatus(item.extension);
  }

  closeRecordingModal(force = false): void {
    if (this.recordingSaving() && !force) {
      return;
    }

    this.recordingModalVisible.set(false);
    this.selectedUser.set(null);
    this.recordingExtension.set('');
    this.recordingDisplayName.set('');

    this.recordingForm.set({
      in_external: 'dontcare',
      in_internal: 'dontcare',
      out_external: 'dontcare',
      out_internal: 'dontcare'
    });
  }

  loadRecordingStatus(extension?: string): void {
    const ext = String(extension || this.recordingExtension() || '').trim();

    if (!ext) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.recordingLoading.set(true);

    this.santralApi.GetSantralCallRecordingSettings(false)
      .pipe(finalize(() => this.recordingLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت تنظیمات ضبط');
            return;
          }

          const items: CallRecordingItem[] = Array.isArray(res?.items)
            ? res.items
            : [];

          const found = items.find(x => String(x.extension) === ext);

          if (!found) {
            this.notificationService.warning('تنظیمات ضبط این داخلی پیدا نشد');
            return;
          }

          this.recordingForm.set({
            in_external: this.fixRecordingMode(found.recording?.in_external),
            in_internal: this.fixRecordingMode(found.recording?.in_internal),
            out_external: this.fixRecordingMode(found.recording?.out_external),
            out_internal: this.fixRecordingMode(found.recording?.out_internal)
          });
        },
        error: (err: any) => {
          console.error('GetSantralCallRecordingSettings error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  onRecordingValueChange(field: RecordingField, value: string): void {
    const mode = this.fixRecordingMode(value);

    this.recordingForm.update(form => ({
      ...form,
      [field]: mode
    }));
  }

  getRecordingValue(field: RecordingField): RecordingMode {
    return this.recordingForm()[field];
  }

  saveRecordingSettings(): void {
    const extension = String(this.recordingExtension() || '').trim();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.recordingSaving.set(true);

    this.santralApi.SaveSantralCallRecordingFields(
      extension,
      this.recordingForm(),
    )
      .pipe(finalize(() => this.recordingSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره تنظیمات ضبط ناموفق بود');
            return;
          }

          this.notificationService.success(res?.ErrDesc || 'تنظیمات ضبط ذخیره شد');

          this.closeRecordingModal(true);
        },
        error: (err: any) => {
          console.error('SaveSantralCallRecordingFields error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره تنظیمات ضبط';

          this.notificationService.error(msg);
        }
      });
  }

  recordingModeFa(value: string): string {
    if (value === 'always') {
      return 'همیشه ضبط شود';
    }

    if (value === 'never') {
      return 'هیچ‌وقت ضبط نشود';
    }

    if (value === 'dontcare') {
      return 'طبق پیش‌فرض';
    }

    return value || 'نامشخص';
  }

  private fixRecordingMode(value: any): RecordingMode {
    const mode = String(value || '').trim();

    if (mode === 'always' || mode === 'never' || mode === 'dontcare') {
      return mode;
    }

    return 'dontcare';
  }

  openVoicemailModal(item: SantralExtensionUser): void {
    const currentName =
      item.display_name ||
      item.user_name ||
      item.device_description ||
      item.extension;

    this.selectedUser.set(item);
    this.voicemailExtension.set(item.extension);
    this.voicemailDisplayName.set(currentName);

    const enabled = String(item.voicemail || '').trim() === 'default';
    const ringtimer = Number(item.ringtimer || 20);

    this.voicemailForm.set({
      enabled,
      password: enabled ? item.extension : '',
      ringtimer: ringtimer > 0 ? ringtimer : 20,
      busy_to_voicemail: true
    });

    this.voicemailMessages.set([]);
    this.voicemailMessagesTab.set('new');

    this.voicemailModalVisible.set(true);
    this.loadVoicemailStatus(item.extension);
    this.loadVoicemailMessages(item.extension);
  }

  closeVoicemailModal(force = false): void {
    if (this.voicemailSaving() && !force) {
      return;
    }

    this.voicemailModalVisible.set(false);
    this.selectedUser.set(null);
    this.voicemailExtension.set('');
    this.voicemailDisplayName.set('');

    this.voicemailForm.set({
      enabled: false,
      password: '',
      ringtimer: 20,
      busy_to_voicemail: true
    });

    this.voicemailMessages.set([]);
    this.voicemailMessagesLoading.set(false);
    this.voicemailMessagesTab.set('new');
  }

  loadVoicemailStatus(extension?: string): void {
    const ext = String(extension || this.voicemailExtension() || '').trim();

    if (!ext) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.voicemailLoading.set(true);

    this.santralApi.SantralVoicemail_Check(ext)
      .pipe(finalize(() => this.voicemailLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت وضعیت صندوق صوتی');
            return;
          }

          const users = Array.isArray(res?.database?.users)
            ? res.database.users
            : [];

          const user = users.length > 0 ? users[0] : null;

          const astdbVoicemail = String(res?.astdb?.AMPUSER_voicemail?.value || '').trim();
          const astdbPassword = String(res?.astdb?.AMPUSER_vmpwd?.value || '').trim();
          const astdbRingtimer = Number(res?.astdb?.AMPUSER_ringtimer?.value || 0);

          const userVoicemail = String(user?.voicemail || '').trim();
          const userPassword = String(user?.password || '').trim();
          const userRingtimer = Number(user?.ringtimer || 0);

          const voicemail = astdbVoicemail || userVoicemail;
          const enabled = voicemail === 'default';
          const password = astdbPassword || userPassword || (enabled ? ext : '');
          const ringtimer = astdbRingtimer > 0
            ? astdbRingtimer
            : userRingtimer > 0
              ? userRingtimer
              : 20;

          const busyToVoicemail = Number(
            res?.settings?.busy_to_voicemail ?? 1
          ) === 1;

          this.voicemailForm.set({
            enabled,
            password,
            ringtimer,
            busy_to_voicemail: busyToVoicemail
          });
        },
        error: (err: any) => {
          console.error('SantralVoicemail_Check error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }


  loadVoicemailMessages(extension?: string): void {
    const ext = String(extension || this.voicemailExtension() || '').trim();

    if (!ext) {
      this.voicemailMessages.set([]);
      return;
    }

    this.voicemailMessagesLoading.set(true);

    this.santralApi.GetSantralVoicemailMessages(ext)
      .pipe(finalize(() => this.voicemailMessagesLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode ?? 1) !== 0) {
            this.voicemailMessages.set([]);
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت پیام‌های صندوق صوتی');
            return;
          }

          const messages = Array.isArray(res?.messages) ? res.messages : [];

          const mappedMessages = messages.map((msg: any) => ({
            ...msg,
            play_url: msg?.has_audio
              ? this.santralApi.SantralVoicemail_PlayUrl(
                String(msg.extension || ext),
                String(msg.folder || 'INBOX'),
                String(msg.message_no || ''),
                String(msg.context || 'default')
              )
              : ''
          }));

          this.voicemailMessages.set(mappedMessages);
        },
        error: (err: any) => {
          console.error('GetSantralVoicemailMessages error:', err);
          this.voicemailMessages.set([]);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  voicemailNewMessages(): any[] {
    return this.voicemailMessages().filter(item => String(item?.folder || '') === 'INBOX');
  }

  voicemailOldMessages(): any[] {
    return this.voicemailMessages().filter(item => String(item?.folder || '') === 'Old');
  }

  visibleVoicemailMessages(): any[] {
    return this.voicemailMessagesTab() === 'new'
      ? this.voicemailNewMessages()
      : this.voicemailOldMessages();
  }

  formatVoicemailDuration(value: any): string {
    const seconds = Number(value || 0);

    if (!seconds || seconds <= 0) {
      return 'نامشخص';
    }

    if (seconds < 60) {
      return `${seconds} ثانیه`;
    }

    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;

    return `${minutes}:${String(rest).padStart(2, '0')}`;
  }

  formatVoicemailDate(value: any): string {
    const timestamp = Number(value || 0);

    if (!timestamp) {
      return 'بدون تاریخ';
    }

    return new Intl.DateTimeFormat('fa-IR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp * 1000));
  }

  onVoicemailEnabledChange(value: boolean): void {
    this.voicemailForm.update(form => ({
      ...form,
      enabled: value,
      password: value && !form.password ? this.voicemailExtension() : form.password,
      ringtimer: value && (!form.ringtimer || form.ringtimer <= 0) ? 20 : form.ringtimer
    }));
  }

  onVoicemailBusyToVoicemailChange(value: boolean): void {
    this.voicemailForm.update(form => ({
      ...form,
      busy_to_voicemail: value
    }));
  }

  onVoicemailPasswordChange(value: string): void {
    this.voicemailForm.update(form => ({
      ...form,
      password: value
    }));
  }

  onVoicemailRingtimerChange(value: any): void {
    const ringtimer = Number(value || 0);

    this.voicemailForm.update(form => ({
      ...form,
      ringtimer
    }));
  }

  saveVoicemailSettings(): void {
    const extension = String(this.voicemailExtension() || '').trim();
    const form = this.voicemailForm();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    const enabled = !!form.enabled;
    const password = String(form.password || '').trim();
    const ringtimer = Number(form.ringtimer || 20);
    const busyToVoicemail = !!form.busy_to_voicemail;

    if (enabled && password && !/^[0-9]{2,10}$/.test(password)) {
      this.notificationService.warning('رمز صندوق صوتی باید عددی و بین ۲ تا ۱۰ رقم باشد');
      return;
    }

    if (enabled && (ringtimer < 5 || ringtimer > 120)) {
      this.notificationService.warning('مدت زمان زنگ باید بین ۵ تا ۱۲۰ ثانیه باشد');
      return;
    }

    this.voicemailSaving.set(true);

    this.santralApi.SantralVoicemail_Save(
      extension,
      enabled,
      enabled ? (password || extension) : '',
      enabled ? ringtimer : 0,
      busyToVoicemail
    )
      .pipe(finalize(() => this.voicemailSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره صندوق صوتی ناموفق بود');
            return;
          }

          this.notificationService.success(res?.ErrDesc || 'تنظیمات صندوق صوتی ذخیره شد');

          this.closeVoicemailModal(true);
          this.loadUsers();
        },
        error: (err: any) => {
          console.error('SantralVoicemail_Save error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره صندوق صوتی';

          this.notificationService.error(msg);
        }
      });
  }



  openCallRulesModal(item: SantralExtensionUser): void {
    const currentName =
      item.display_name ||
      item.user_name ||
      item.device_description ||
      item.extension;

    this.selectedUser.set(item);
    this.callRulesExtension.set(item.extension);
    this.callRulesDisplayName.set(currentName);

    this.callRulesForm.set({
      allow_internal: true,
      allow_outbound: true,
      allow_external_inbound: true
    });

    this.callRulesModalVisible.set(true);
    this.loadCallRules(item.extension);
  }

  closeCallRulesModal(force = false): void {
    if (this.callRulesSaving() && !force) {
      return;
    }

    this.callRulesModalVisible.set(false);
    this.selectedUser.set(null);
    this.callRulesExtension.set('');
    this.callRulesDisplayName.set('');

    this.callRulesForm.set({
      allow_internal: true,
      allow_outbound: true,
      allow_external_inbound: true
    });
  }

  loadCallRules(extension?: string): void {
    const ext = String(extension || this.callRulesExtension() || '').trim();

    if (!ext) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.callRulesLoading.set(true);

    this.santralApi.GetSantralExtensionCallRules(ext, false)
      .pipe(finalize(() => this.callRulesLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode ?? 1) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت محدودیت تماس');
            return;
          }

          const rules = res?.rules || {};

          this.callRulesForm.set({
            allow_internal: this.toBoolRule(rules?.allow_internal, true),
            allow_outbound: this.toBoolRule(rules?.allow_outbound, true),
            allow_external_inbound: this.toBoolRule(rules?.allow_external_inbound, true)
          });
        },
        error: (err: any) => {
          console.error('GetSantralExtensionCallRules error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  onCallRuleChange(field: keyof CallRulesForm, value: boolean): void {
    this.callRulesForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  saveCallRules(): void {
    const extension = String(this.callRulesExtension() || '').trim();
    const form = this.callRulesForm();

    if (!extension) {
      this.notificationService.warning('شماره داخلی نامعتبر است');
      return;
    }

    this.callRulesSaving.set(true);

    this.santralApi.SaveSantralExtensionCallRules(
      extension,
      form.allow_internal,
      form.allow_outbound,
      form.allow_external_inbound,
      false
    )
      .pipe(finalize(() => this.callRulesSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode ?? 1) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره محدودیت تماس ناموفق بود');
            return;
          }

          this.notificationService.success(res?.ErrDesc || 'محدودیت تماس ذخیره شد');
          this.closeCallRulesModal(true);
        },
        error: (err: any) => {
          console.error('SaveSantralExtensionCallRules error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره محدودیت تماس';

          this.notificationService.error(msg);
        }
      });
  }

  callRuleStatusText(value: boolean): string {
    return value ? 'مجاز' : 'مسدود';
  }

  private toBoolRule(value: any, defaultValue: boolean): boolean {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = String(value).trim().toLowerCase();

    if (normalized === '1' || normalized === 'true' || normalized === 'yes') {
      return true;
    }

    if (normalized === '0' || normalized === 'false' || normalized === 'no') {
      return false;
    }

    return defaultValue;
  }

}
