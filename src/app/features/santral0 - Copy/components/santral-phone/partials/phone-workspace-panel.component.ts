import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CallLogItem, PhoneBookItem } from '../../../models/webphone.models';
import { secondsToClock, toFaNumber } from '../../../shared/utils/santral-format.util';

type WorkspaceTab = 'phonebook' | 'favorites' | 'logs' | 'voicemail';
type LogFilter = 'received' | 'missed' | 'outgoing';

@Component({
  selector: 'app-phone-workspace-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="kws-workspace-panel">
      <div class="kws-workspace-card">
        <div class="kws-workspace-header">
          <div class="kws-workspace-title-box">
            <h5 class="kws-workspace-title">مرکز تماس</h5>
            <div class="kws-workspace-subtitle">دفترچه تلفن، شماره‌های من، تاریخچه تماس‌ها و صندوق صوتی</div>
          </div>

          <div class="kws-workspace-tabs">
            <button
              type="button"
              [class.is-active]="workspaceTab === 'favorites'"
              (click)="setWorkspaceTab.emit('favorites')">
              شماره‌های من
            </button>

            <button
              type="button"
              [class.is-active]="workspaceTab === 'phonebook'"
              (click)="setWorkspaceTab.emit('phonebook')">
              دفترچه تلفن
            </button>

            <button
              type="button"
              class="kws-tab-with-badge"
              [class.is-active]="workspaceTab === 'voicemail'"
              (click)="setWorkspaceTab.emit('voicemail')">
              صندوق صوتی

              @if (newVoicemailMessages().length > 0) {
                <span class="kws-missed-badge">
                  {{ newVoicemailMessages().length }}
                </span>
              }
            </button>

            <button
              type="button"
              class="kws-tab-with-badge"
              [class.is-active]="workspaceTab === 'logs'"
              (click)="setWorkspaceTab.emit('logs')">
              لاگ تماس‌ها

              @if (missedCallBadgeCount > 0) {
                <span class="kws-missed-badge">
                  {{ missedCallBadgeCount }}
                </span>
              }
            </button>
          </div>
        </div>

        @if (workspaceTab === 'phonebook') {
          <div class="kws-workspace-body">
            <div class="kws-panel-toolbar">
              <input
                type="text"
                class="kws-workspace-search"
                placeholder="جستجوی نام، شماره یا توضیح"
                [ngModel]="phoneBookSearch"
                (ngModelChange)="phoneBookSearchChange.emit($event)" />
            </div>

            <div class="kws-big-list">
              @for (item of filteredPhoneBook; track item.id || item.number) {
                <div class="kws-big-list-item">
                  <button type="button" class="kws-big-list-pick" (click)="pickPhoneBookItem.emit(item)">
                    <div class="kws-big-list-main">
                      <strong>{{ item.name || item.number }}</strong>
                      @if (item.explain) {
                        <span>{{ item.explain }}</span>
                      }
                    </div>

                    <div class="kws-big-list-side">
                      <em>{{ item.number }}</em>
                      <small>انتخاب برای تماس</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="kws-favorite-btn"
                    [class.active]="item.isFavorite"
                    (click)="togglePhoneBookFavorite.emit({ item, event: $event })"
                    [title]="item.isFavorite ? 'حذف از شماره‌های من' : 'ذخیره برای من'">
                    <i [class]="item.isFavorite ? 'mdi mdi-star' : 'mdi mdi-star-outline'"></i>
                  </button>
                </div>
              } @empty {
                <div class="kws-empty-state">موردی در دفترچه تلفن پیدا نشد</div>
              }
            </div>
          </div>
        } @else if (workspaceTab === 'favorites') {
          <div class="kws-workspace-body">
            <div class="kws-panel-toolbar">
              <input
                type="text"
                class="kws-workspace-search"
                placeholder="جستجو در شماره‌های من"
                [ngModel]="phoneBookSearch"
                (ngModelChange)="phoneBookSearchChange.emit($event)" />
            </div>

            <div class="kws-big-list">
              @for (item of favoritePhoneBook; track item.favoriteId || item.id || item.number) {
                <div class="kws-big-list-item is-favorite-row">
                  <button type="button" class="kws-big-list-pick" (click)="pickPhoneBookItem.emit(item)">
                    <div class="kws-big-list-main">
                      <strong>{{ item.name || item.number }}</strong>
                      @if (item.explain) {
                        <span>{{ item.explain }}</span>
                      }
                    </div>

                    <div class="kws-big-list-side">
                      <em>{{ item.number }}</em>
                      <small>انتخاب برای تماس</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="kws-favorite-btn active"
                    (click)="togglePhoneBookFavorite.emit({ item, event: $event })"
                    title="حذف از شماره‌های من">
                    <i class="mdi mdi-star"></i>
                  </button>
                </div>
              } @empty {
                <div class="kws-empty-state">هنوز شماره‌ای برای این داخلی ذخیره نشده است</div>
              }
            </div>
          </div>
        } @else if (workspaceTab === 'voicemail') {
          <div class="kws-workspace-body">
            <div class="kws-log-filter-row">
              <button
                type="button"
                class="kws-log-filter-btn"
                (click)="refreshVoicemail.emit()">
                بروزرسانی پیام‌ها
              </button>
            </div>

            <div class="kws-voicemail-tabs">
              <button
                type="button"
                [class.is-active]="voicemailTab === 'new'"
                (click)="voicemailTab = 'new'">
                جدیدها

                @if (newVoicemailMessages().length > 0) {
                  <span>{{ newVoicemailMessages().length }}</span>
                }
              </button>

              <button
                type="button"
                [class.is-active]="voicemailTab === 'old'"
                (click)="voicemailTab = 'old'">
                خوانده‌شده‌ها

                @if (oldVoicemailMessages().length > 0) {
                  <span>{{ oldVoicemailMessages().length }}</span>
                }
              </button>
            </div>

            <div class="kws-big-list">
              @if (voicemailLoading) {
                <div class="kws-empty-state">در حال دریافت پیام‌ها...</div>
              } @else {
                @for (msg of visibleVoicemailMessages(); track msg.id) {
                  <div class="kws-voicemail-card" [class.is-new]="msg.folder === 'INBOX'" [class.is-old]="msg.folder === 'Old'">
                    <div class="kws-voicemail-head">
                      <div class="kws-voicemail-caller">
                        <i class="mdi mdi-voicemail"></i>

                        <div>
                          <strong>{{ msg.caller_number || 'شماره نامشخص' }}</strong>
                          <span>{{ msg.folder_title }}</span>
                        </div>
                      </div>

                      <div class="kws-voicemail-meta">
                        <span>{{ formatVoicemailDuration(msg.duration) }}</span>
                        <small>{{ formatVoicemailDate(msg.origtime) }}</small>
                      </div>
                    </div>

                    @if (msg.has_audio && msg.play_url) {
                      <div class="kws-voicemail-player">
                        <audio
                          class="kws-voicemail-audio"
                          controls
                          preload="none"
                          [src]="msg.play_url">
                        </audio>
                      </div>
                    }

                    <div class="kws-voicemail-actions">
                      @if (msg.folder === 'INBOX') {
                        <button
                          type="button"
                          class="kws-voicemail-read"
                          (click)="moveVoicemailToOld.emit(msg)">
                          <i class="mdi mdi-check-circle-outline"></i>
                          خوانده شد
                        </button>
                      }

                      @if (msg.folder === 'Old') {
                        <button
                          type="button"
                          class="kws-voicemail-delete"
                          (click)="deleteVoicemail.emit(msg)">
                          <i class="mdi mdi-delete-outline"></i>
                          حذف پیام
                        </button>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="kws-empty-state">
                    {{ voicemailTab === 'new' ? 'پیام جدیدی وجود ندارد' : 'پیام خوانده‌شده‌ای وجود ندارد' }}
                  </div>
                }
              }
            </div>
          </div>
        } @else {
          <div class="kws-workspace-body">
            <div class="kws-log-filter-row">
              <button
                type="button"
                class="kws-log-filter-btn"
                [class.is-active]="logFilter === 'received'"
                (click)="setLogFilter.emit('received')">
                دریافتی
              </button>

              <button
                type="button"
                class="kws-log-filter-btn"
                [class.is-active]="logFilter === 'outgoing'"
                (click)="setLogFilter.emit('outgoing')">
                خروجی
              </button>

              <button
                type="button"
                class="kws-log-filter-btn kws-tab-with-badge"
                [class.is-active]="logFilter === 'missed'"
                (click)="setLogFilter.emit('missed')">
                از دست رفته

                @if (missedCallBadgeCount > 0) {
                  <span class="kws-missed-badge">
                    {{ missedCallBadgeCount }}
                  </span>
                }
              </button>
            </div>

            <div class="kws-big-list">
              @for (log of visibleCallLogs; track log.id) {
                <div class="kws-big-list-item">
                  <button type="button" class="kws-big-list-pick" (click)="callFromLog.emit(log)">
                    <div class="kws-big-list-main">
                      <strong>{{ log.name || log.number }}</strong>
                      <span>{{ formatLogTime(log.startedAt) }}</span>
                    </div>

                    <div class="kws-big-list-side">
                      <em>{{ log.number }}</em>
                      <small>{{ getLogSubtitle(log) }}</small>
                    </div>
                  </button>
                </div>
              } @empty {
                <div class="kws-empty-state">گزارشی برای نمایش وجود ندارد</div>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class PhoneWorkspacePanelComponent {
  @Input() workspaceTab: WorkspaceTab = 'favorites';
  @Input() phoneBookSearch = '';
  @Input() filteredPhoneBook: PhoneBookItem[] = [];
  @Input() favoritePhoneBook: PhoneBookItem[] = [];
  @Input() logFilter: LogFilter = 'received';
  @Input() visibleCallLogs: CallLogItem[] = [];
  @Input() missedCallBadgeCount = 0;
  @Input() voicemailMessages: any[] = [];
  @Input() voicemailLoading = false;

  @Output() setWorkspaceTab = new EventEmitter<WorkspaceTab>();
  @Output() phoneBookSearchChange = new EventEmitter<string>();
  @Output() pickPhoneBookItem = new EventEmitter<PhoneBookItem>();
  @Output() togglePhoneBookFavorite = new EventEmitter<{ item: PhoneBookItem; event: Event }>();
  @Output() setLogFilter = new EventEmitter<LogFilter>();
  @Output() callFromLog = new EventEmitter<CallLogItem>();
  @Output() refreshVoicemail = new EventEmitter<void>();
  @Output() deleteVoicemail = new EventEmitter<any>();
  @Output() moveVoicemailToOld = new EventEmitter<any>();

  voicemailTab: 'new' | 'old' = 'new';

  newVoicemailMessages(): any[] {
    return this.voicemailMessages.filter(item => item.folder === 'INBOX');
  }

  oldVoicemailMessages(): any[] {
    return this.voicemailMessages.filter(item => item.folder === 'Old');
  }

  visibleVoicemailMessages(): any[] {
    return this.voicemailTab === 'new'
      ? this.newVoicemailMessages()
      : this.oldVoicemailMessages();
  }

  formatLogTime(value: number): string {
    if (!value) {
      return '';
    }

    return new Date(value).toLocaleString('fa-IR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) {
      return '۰ ثانیه';
    }

    if (seconds < 60) {
      return `${toFaNumber(seconds)} ثانیه`;
    }

    return toFaNumber(secondsToClock(seconds));
  }

  formatVoicemailDuration(value: any): string {
    const seconds = Number(value ?? 0);

    if (!seconds || seconds <= 0) {
      return 'نامشخص';
    }

    if (seconds < 60) {
      return `${toFaNumber(seconds)} ثانیه`;
    }

    return toFaNumber(secondsToClock(seconds));
  }

  formatVoicemailDate(value: any): string {
    const timestamp = Number(value ?? 0);

    if (!timestamp) {
      return 'بدون تاریخ';
    }

    const date = new Date(timestamp * 1000);

    return new Intl.DateTimeFormat('fa-IR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getLogStatusText(log: CallLogItem): string {
    const status = String((log as any).status || '');

    if (log.direction === 'outgoing') {
      if (status === 'answered') {
        return 'خروجی موفق';
      }

      if (status === 'busy') {
        return 'خروجی اشغال';
      }

      if (status === 'failed') {
        return 'خروجی ناموفق';
      }

      if (status === 'canceled') {
        return 'خروجی لغو شده';
      }

      return 'خروجی بی‌پاسخ';
    }

    if (log.direction === 'missed') {
      return 'از دست رفته';
    }

    return 'دریافتی';
  }

  getLogSubtitle(log: CallLogItem): string {
    const title = this.getLogStatusText(log);

    if (!log.durationSeconds || log.durationSeconds <= 0) {
      return title;
    }

    return `${title} - ${this.formatDuration(log.durationSeconds)}`;
  }
}
