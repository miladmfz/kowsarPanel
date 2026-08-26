import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PhoneCallStatus,
  RegisterStatus,
  WebPhoneLine
} from '../../../models/webphone.models';

@Component({
  selector: 'app-phone-dialer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="kws-phone-panel">
      <div class="kws-phone-card">
        <div class="kws-phone-header">
          <div class="kws-phone-identity">
            <div class="kws-phone-icon">
              <i class="mdi mdi-phone-classic"></i>
            </div>

            <div class="kws-phone-title-area">
              <h5 class="kws-phone-title">تلفن داخلی</h5>
              <div class="kws-phone-subtitle">
                داخلی شما:
                <strong>{{ callerExtension || '-' }}</strong>
              </div>
            </div>
          </div>

          <div class="kws-phone-top-controls">
            <div
              class="kws-register-pill"
              [class.is-online]="registerStatus === 'registered'"
              [class.is-connecting]="registerStatus === 'connecting'"
              [class.is-failed]="registerStatus === 'failed'">
              <span class="kws-status-dot"></span>
              <span>{{ registerText }}</span>
            </div>

            <div class="kws-connect-toggle" title="اتصال WebPhone">
              <button
                type="button"
                class="kws-connect-toggle-btn"
                [class.is-active]="registerStatus === 'registered'"
                (click)="connectWebPhone.emit()"
                [disabled]="registerStatus === 'connecting' || registerStatus === 'registered'">
                <i class="mdi mdi-link-variant"></i>
                <span>اتصال</span>
              </button>

              <button
                type="button"
                class="kws-connect-toggle-btn is-danger"
                [class.is-active]="registerStatus !== 'registered'"
                (click)="disconnectWebPhone.emit()"
                [disabled]="registerStatus !== 'registered'">
                <i class="mdi mdi-link-variant-off"></i>
                <span>قطع</span>
              </button>
            </div>

            <button
              type="button"
              class="kws-audio-compact-btn"
              [class.is-open]="ringtoneSettingsOpen"
              [attr.title]="'تنظیمات صدا | زنگ: ' + ringtoneGainLabel + ' | مکالمه: ' + callVolumeGainLabel"
              (click)="toggleRingtoneSettings.emit()">
              <i class="mdi mdi-cog-outline"></i>
              <span class="visually-hidden">تنظیمات صدا</span>
            </button>
          </div>
        </div>

        @if (ringtoneSettingsOpen) {
          <div class="kws-audio-settings-panel">
            <div class="kws-audio-section">
              <div class="kws-audio-section-head">
                <div>
                  <strong>صدای زنگ</strong>
                  <span>برای تماس ورودی</span>
                </div>

                <button
                  type="button"
                  class="kws-audio-toggle"
                  [class.is-on]="ringtoneBoostEnabled"
                  (click)="toggleRingtoneBoost.emit()">
                  {{ ringtoneBoostEnabled ? 'فعال' : 'خاموش' }}
                </button>
              </div>

              <div class="kws-audio-slider-row">
                <span>0.5x</span>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  [ngModel]="ringtoneGainValue"
                  (ngModelChange)="ringtoneGainValueChange.emit($event)"
                  [disabled]="!ringtoneBoostEnabled" />
                <strong>{{ ringtoneGainLabel }}</strong>
              </div>

              <button
                type="button"
                class="kws-audio-test-btn"
                (click)="previewIncomingRingtone.emit()">
                <i class="mdi mdi-play-circle-outline"></i>
                تست زنگ
              </button>
            </div>

            <div class="kws-audio-section">
              <div class="kws-audio-section-head">
                <div>
                  <strong>صدای مکالمه</strong>
                  <span>صدای طرف مقابل</span>
                </div>

                <button
                  type="button"
                  class="kws-audio-toggle"
                  [class.is-on]="callVolumeBoostEnabled"
                  (click)="toggleCallVolumeBoost.emit()">
                  {{ callVolumeBoostEnabled ? 'فعال' : 'خاموش' }}
                </button>
              </div>

              <div class="kws-audio-slider-row">
                <span>0.1x</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  [ngModel]="callVolumeGainValue"
                  (ngModelChange)="callVolumeGainValueChange.emit($event)"
                  [disabled]="!callVolumeBoostEnabled" />
                <strong>{{ callVolumeGainLabel }}</strong>
              </div>
            </div>
          </div>
        }

        <div class="kws-line-tabs">
          @for (line of lines; track line.index) {
            <button
              type="button"
              class="kws-line-tab"
              [title]="getLineText(line)"
              [class.is-active]="activeLineIndex === line.index"
              [class.is-busy]="line.status === 'active'"
              [class.is-held]="line.status === 'held'"
              [class.is-incoming]="line.status === 'incoming'"
              [class.is-empty]="line.status === 'empty'"
              (click)="selectLine.emit(line.index)">
              <span>{{ line.label }}</span>
              @if (line.status !== 'empty') {
                <small>{{ getLineText(line) }}</small>
              }
            </button>
          }
        </div>

        @if (showStatusStrip()) {
          <div
            class="kws-phone-status"
            [class.is-calling]="callStatus === 'calling'"
            [class.is-sent]="callStatus === 'sent' || activeLine?.status === 'active'"
            [class.is-holding]="callStatus === 'holding' || activeLine?.status === 'held'"
            [class.is-hangingup]="callStatus === 'hangingup'"
            [class.is-ended]="callStatus === 'ended'"
            [class.is-busy]="callStatus === 'busy'"
            [class.is-noanswer]="callStatus === 'noanswer'"
            [class.is-rejected]="callStatus === 'rejected'"
            [class.is-error]="callStatus === 'error'">
            <i [class]="getStatusIconClass()"></i>
            <span>{{ getCompactStatusText() }}</span>
            @if (activeLine?.status === 'active' || activeLine?.status === 'held') {
              <b>•</b>
              <strong>{{ activeCallDurationText }}</strong>
            }
          </div>
        }

        @if (incomingLine) {
          <div class="kws-incoming-card">
            <div class="kws-incoming-icon">
              <i class="mdi mdi-phone-incoming"></i>
            </div>

            <div class="kws-incoming-info">
              <div class="kws-incoming-title">تماس ورودی - {{ incomingLine.label }}</div>
              <div class="kws-incoming-number">{{ incomingLine.name || incomingLine.number || 'Unknown' }}</div>
            </div>

            <div class="kws-incoming-actions">
              <button type="button" class="kws-incoming-btn is-answer" (click)="answerIncomingCall.emit(incomingLine.index)">
                <i class="mdi mdi-phone"></i>
                <span>پاسخ</span>
              </button>

              <button type="button" class="kws-incoming-btn is-reject" (click)="rejectIncomingCall.emit(incomingLine.index)">
                <i class="mdi mdi-phone-hangup"></i>
                <span>رد تماس</span>
              </button>
            </div>
          </div>
        }

        <div class="kws-phone-screen" [class.has-value]="!!targetNumber">
          <div class="kws-screen-label">شماره مقصد</div>

          <input
            type="tel"
            inputmode="tel"
            class="kws-number-input"
            placeholder="شماره را وارد کنید"
            [ngModel]="targetNumber"
            (ngModelChange)="targetNumberChange.emit($event)"
            (keydown.enter)="enterCall.emit($event)"
            [disabled]="!canEditDial" />

          <button
            type="button"
            class="kws-backspace-btn"
            title="حذف آخرین رقم"
            (click)="backspace.emit()"
            [disabled]="!targetNumber || !canEditDial">
            <i class="mdi mdi-backspace-outline"></i>
          </button>

          @if (targetNumber && canEditDial) {
            <button
              type="button"
              class="kws-trash-number-btn"
              title="پاک کردن شماره"
              (click)="clearNumber.emit()">
              <i class="mdi mdi-trash-can-outline"></i>
            </button>
          }
        </div>

        @if (resultMessage && callStatus !== 'calling') {
          <div
            class="kws-call-message"
            [class.is-success]="callStatus === 'ended'"
            [class.is-warning]="callStatus === 'busy' || callStatus === 'noanswer' || callStatus === 'rejected'"
            [class.is-error]="callStatus === 'error'">
            {{ resultMessage }}
          </div>
        }

        <div class="kws-keypad" [class.is-disabled]="!canUseKeypad">
          @for (row of keypad; track $index) {
            <div class="kws-keypad-row">
              @for (key of row; track key) {
                <button
                  type="button"
                  class="kws-keypad-btn"
                  (pointerdown)="tapKey($event, key)"
                  [disabled]="!canUseKeypad">
                  {{ key }}
                </button>
              }
            </div>
          }
        </div>

        <div class="kws-phone-actions">
          <button type="button" class="kws-phone-action-btn kws-phone-call-btn" (click)="startCall.emit()" [disabled]="!canCall">
            @if (isCalling) {
              <span class="spinner-border spinner-border-sm"></span>
              <span>شماره‌گیری</span>
            } @else if (activeLine?.status === 'active') {
              <i class="mdi mdi-phone-in-talk"></i>
              <span>در تماس</span>
            } @else {
              <i class="mdi mdi-phone"></i>
              <span>تماس</span>
            }
          </button>

          <button type="button" class="kws-phone-action-btn kws-phone-hangup-btn" (click)="endCall.emit()" [disabled]="!canHangup">
            @if (isHangingUp) {
              <span class="spinner-border spinner-border-sm"></span>
              <span>در حال قطع</span>
            } @else {
              <i class="mdi mdi-phone-hangup"></i>
              <span>قطع تماس</span>
            }
          </button>
        </div>

        @if (hasCallTools()) {
          <div class="kws-call-tools">
            <button
              type="button"
              class="kws-tool-btn"
              [class.is-active]="activeLine?.status === 'held'"
              (click)="toggleHoldActiveLine.emit()"
              [disabled]="!canHold && !canResume">
              <i class="mdi mdi-pause-circle-outline"></i>
              <span>{{ activeLine?.status === 'held' ? 'برگرداندن' : 'نگه داشتن' }}</span>
            </button>

            <button
              type="button"
              class="kws-tool-btn"
              [class.is-active]="activeLine?.muted"
              (click)="toggleMuteActiveLine.emit()"
              [disabled]="!canMute">
              <i class="mdi mdi-microphone-off"></i>
              <span>{{ activeLine?.muted ? 'فعال کردن صدا' : 'قطع صدا' }}</span>
            </button>

            <button
              type="button"
              class="kws-tool-btn"
              [class.is-active]="showTransferBox"
              (click)="toggleTransferBox.emit()"
              [disabled]="!activeLine?.session">
              <i class="mdi mdi-phone-forward"></i>
              <span>انتقال تماس</span>
            </button>
          </div>
        }

        @if (showTransferBox && hasCallTools()) {
          <div class="kws-transfer-box">
            <input
              type="tel"
              inputmode="tel"
              class="kws-transfer-input"
              placeholder="داخلی مقصد انتقال"
              [ngModel]="transferNumber"
              (ngModelChange)="transferNumberChange.emit($event)" />

            <button type="button" class="kws-transfer-btn" (click)="transferActiveLine.emit()" [disabled]="!canTransfer">
              انتقال
            </button>
          </div>
        }

        @if (showConferenceBox) {
          <div class="kws-conference-box">
            <div class="kws-conference-title">
              <i class="mdi mdi-account-multiple-plus-outline"></i>
              افزودن نفر سوم به مکالمه
            </div>

            <div class="kws-conference-row">
              <input
                type="tel"
                inputmode="tel"
                class="kws-conference-input"
                placeholder="شماره یا داخلی نفر سوم"
                [ngModel]="conferenceNumber"
                (ngModelChange)="conferenceNumberChange.emit($event)" />

              <button
                type="button"
                class="kws-conference-btn"
                (click)="startConference.emit()"
                [disabled]="conferenceLoading || !conferenceNumber">
                @if (conferenceLoading) {
                  <span class="spinner-border spinner-border-sm"></span>
                  <span>در حال دعوت</span>
                } @else {
                  <i class="mdi mdi-phone-plus-outline"></i>
                  <span>دعوت</span>
                }
              </button>
            </div>
          </div>
        }
      </div>
    </section>
  `
})
export class PhoneDialerPanelComponent {
  @Input() callerExtension = '';
  @Input() registerStatus: RegisterStatus = 'offline';
  @Input() registerText = '';
  @Input() lines: WebPhoneLine[] = [];
  @Input() activeLineIndex = 1;
  @Input() activeLine!: WebPhoneLine;
  @Input() incomingLine: WebPhoneLine | null = null;
  @Input() callStatus: PhoneCallStatus = 'idle';
  @Input() statusText = '';
  @Input() targetNumber = '';
  @Input() transferNumber = '';
  @Input() showTransferBox = false;
  @Input() conferenceNumber = '';
  @Input() showConferenceBox = false;
  @Input() conferenceLoading = false;
  @Input() resultMessage = '';
  @Input() isCalling = false;
  @Input() isHangingUp = false;
  @Input() keypad: string[][] = [];
  @Input() canEditDial = false;
  @Input() canCall = false;
  @Input() canHangup = false;
  @Input() canHold = false;
  @Input() canResume = false;
  @Input() canMute = false;
  @Input() canTransfer = false;
  @Input() canConference = false;
  @Input() activeCallDurationText = '00:00';
  @Input() ringtoneSettingsOpen = false;
  @Input() ringtoneBoostEnabled = true;
  @Input() ringtoneGainValue = 2.5;
  @Input() ringtoneGainLabel = '2.5x';
  @Input() callVolumeBoostEnabled = true;
  @Input() callVolumeGainValue = 1;
  @Input() callVolumeGainLabel = '1.0x';
  @Input() canUseKeypad = false;

  @Output() connectWebPhone = new EventEmitter<void>();
  @Output() disconnectWebPhone = new EventEmitter<void>();
  @Output() selectLine = new EventEmitter<number>();
  @Output() answerIncomingCall = new EventEmitter<number>();
  @Output() rejectIncomingCall = new EventEmitter<number>();
  @Output() targetNumberChange = new EventEmitter<string>();
  @Output() transferNumberChange = new EventEmitter<string>();
  @Output() conferenceNumberChange = new EventEmitter<string>();
  @Output() enterCall = new EventEmitter<Event>();
  @Output() backspace = new EventEmitter<void>();
  @Output() pressKey = new EventEmitter<string>();
  @Output() startCall = new EventEmitter<void>();
  @Output() endCall = new EventEmitter<void>();
  @Output() toggleHoldActiveLine = new EventEmitter<void>();
  @Output() toggleMuteActiveLine = new EventEmitter<void>();
  @Output() toggleTransferBox = new EventEmitter<void>();
  @Output() transferActiveLine = new EventEmitter<void>();
  @Output() toggleConferenceBox = new EventEmitter<void>();
  @Output() startConference = new EventEmitter<void>();
  @Output() clearNumber = new EventEmitter<void>();
  @Output() toggleRingtoneSettings = new EventEmitter<void>();
  @Output() toggleRingtoneBoost = new EventEmitter<void>();
  @Output() ringtoneGainValueChange = new EventEmitter<number | string>();
  @Output() previewIncomingRingtone = new EventEmitter<void>();
  @Output() toggleCallVolumeBoost = new EventEmitter<void>();
  @Output() callVolumeGainValueChange = new EventEmitter<number | string>();

  tapKey(event: Event, key: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.canUseKeypad) {
      return;
    }

    this.pressKey.emit(key);
  }

  hasCallTools(): boolean {
    return !!this.activeLine?.session && (
      this.activeLine.status === 'active' ||
      this.activeLine.status === 'held'
    );
  }

  showStatusStrip(): boolean {
    return (
      !!this.incomingLine ||
      this.hasCallTools() ||
      this.callStatus === 'calling' ||
      this.callStatus === 'holding' ||
      this.callStatus === 'hangingup' ||
      this.callStatus === 'busy' ||
      this.callStatus === 'noanswer' ||
      this.callStatus === 'rejected' ||
      this.callStatus === 'error' ||
      this.callStatus === 'ended'
    );
  }

  getCompactStatusText(): string {
    if (this.incomingLine) {
      return 'تماس ورودی';
    }

    if (this.activeLine?.status === 'active') {
      return 'در حال مکالمه';
    }

    if (this.activeLine?.status === 'held') {
      return 'تماس در انتظار';
    }

    return this.statusText || 'آماده تماس';
  }

  getStatusIconClass(): string {
    if (this.incomingLine) {
      return 'mdi mdi-phone-incoming';
    }

    if (this.activeLine?.status === 'held' || this.callStatus === 'holding') {
      return 'mdi mdi-pause-circle-outline';
    }

    if (this.activeLine?.status === 'active' || this.callStatus === 'sent') {
      return 'mdi mdi-phone-in-talk';
    }

    if (this.callStatus === 'error') {
      return 'mdi mdi-alert-circle-outline';
    }

    return 'mdi mdi-phone-outline';
  }

  getLineText(line: WebPhoneLine): string {
    switch (line.status) {
      case 'incoming':
        return 'ورودی';
      case 'dialing':
      case 'ringing':
        return 'زنگ';
      case 'active':
        return line.muted ? 'بی‌صدا' : 'فعال';
      case 'held':
        return 'انتظار';
      case 'ended':
        return 'پایان';
      case 'failed':
        return 'خطا';
      default:
        return 'آزاد';
    }
  }
}
