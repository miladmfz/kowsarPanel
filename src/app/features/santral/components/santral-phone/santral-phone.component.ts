import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SantralWebApiService } from '../../services/santralapi.service';
import {
  CallDirection,
  CallLogItem,
  PhoneBookItem,
  PhoneCustomerContext,
  PhoneCallStatus,
  RegisterStatus,
  WebPhoneLine
} from '../../models/webphone.models';
import { cleanSantralText, secondsToClock, toFaNumber } from '../../shared/utils/santral-format.util';
import { WebPhoneTonePlayer } from '../../shared/webphone/webphone-tone-player';
import { WebPhoneNotificationManager } from '../../shared/webphone/webphone-notification-manager';
import { PwaInstallService } from '../../services/pwa-install.service';
import { PhoneDialerPanelComponent } from './partials/phone-dialer-panel.component';
import { PhoneWorkspacePanelComponent } from './partials/phone-workspace-panel.component';
import { PhoneCustomerContextPanelComponent } from './partials/phone-customer-context-panel.component';
import { WebPhoneService } from '../../services/webphone.service';
import { WebPhoneAudioService } from '../../services/webphone-audio.service';
import { CustomerWebApiService } from 'src/app/features/internal/services/CustomerWebApi.service';
@Component({
  selector: 'app-santral-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneDialerPanelComponent, PhoneWorkspacePanelComponent, PhoneCustomerContextPanelComponent],
  templateUrl: './santral-phone.component.html',
  styleUrls: [
    './santral-phone.component.css',
    './styles/santral-phone.layout.css',
    './styles/santral-phone.dialer.css',
    './styles/santral-phone.workspace.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class SantralPhoneComponent implements OnInit, OnDestroy {

  private config = inject(AppConfigService);
  private session = inject(SessionStorageService);
  private santralApi = inject(SantralWebApiService) as any;
  private kowsarBaseApi = inject(CustomerWebApiService);
  private pwaInstallService = inject(PwaInstallService);
  private webPhoneService = inject(WebPhoneService);
  private webPhoneAudioService = inject(WebPhoneAudioService);
  private router = inject(Router);
  @ViewChild('remoteAudio')
  remoteAudio?: ElementRef<HTMLAudioElement>;

  callerExtension = signal('');

  webPhoneWsUrl = signal('');
  webPhoneDomain = signal('');
  webPhoneExtension = signal('');
  webPhonePassword = signal('');
  webPhoneConfigLoaded = signal(false);

  lines = this.webPhoneService.lines;

  activeLineIndex = this.webPhoneService.activeLineIndex;

  targetNumber = signal('');
  targetDialNumber = signal('');
  transferNumber = signal('');
  showTransferBox = signal(false);

  conferenceNumber = signal('');
  showConferenceBox = signal(false);
  conferenceLoading = signal(false);
  conferenceRoom = signal('');

  phoneBook = signal<PhoneBookItem[]>([]);
  phoneBookSearch = signal('');
  showPhoneBook = signal(false);

  // State سراسری است؛ با رفتن به صفحه تیکت/فاکتور و برگشتن از بین نمی‌رود.
  callCustomerContext = this.webPhoneService.customerContext;
  callCustomerContextLoading = this.webPhoneService.customerContextLoading;
  private callCustomerContextRequestId = 0;

  callLogs = signal<CallLogItem[]>([]);
  logFilter = signal<'received' | 'missed' | 'outgoing'>('received');

  voicemailMessages = signal<any[]>([]);
  voicemailLoading = signal(false);

  callStatus = signal<PhoneCallStatus>('idle');

  registerStatus = signal<RegisterStatus>('offline');
  registerMessage = signal('');

  isCalling = signal(false);
  isHangingUp = signal(false);

  resultMessage = signal('');
  nowTick = signal(Date.now());

  private liveClockTimer: any = null;
  private ua: any = null;
  private readonly notificationManager = new WebPhoneNotificationManager();

  private resultClearTimer: any = null;
  private readonly ringbackTone = new WebPhoneTonePlayer({
    frequencies: [440, 480],
    gain: 0.035,
    toneDurationMs: 750,
    intervalMs: 2300
  });

  private readonly incomingTone = new WebPhoneTonePlayer({
    frequencies: [880],
    gain: 0.04,
    toneDurationMs: 450,
    intervalMs: 1200
  });

  private readonly busyTone = new WebPhoneTonePlayer({
    frequencies: [480, 620],
    gain: 0.055,
    toneDurationMs: 250,
    intervalMs: 500
  });

  private failureToneTimer: any = null;

  keypad = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['*', '0', '#']
  ];
  webPhoneDebug = signal<string[]>([]);
  remoteAudioState = signal('idle');

  ringtoneSettingsOpen = signal(false);
  ringtoneBoostEnabled = signal(true);
  ringtoneGainValue = signal(2.5);
  callVolumeBoostEnabled = signal(true);
  callVolumeGainValue = signal(1);

  private readonly ringtoneSettingsKey = 'kowsar_webphone_ringtone_settings';
  private readonly incomingRingtoneUrl = 'assets/sounds/incoming-ringtone.mp3';
  private incomingRingtoneAudio: HTMLAudioElement | null = null;
  private incomingRingtoneContext: AudioContext | null = null;
  private incomingRingtoneSource: MediaElementAudioSourceNode | null = null;
  private incomingRingtoneGain: GainNode | null = null;
  private incomingRingtoneCompressor: DynamicsCompressorNode | null = null;
  private incomingRingtoneActive = false;
  private incomingRingtoneRunId = 0;

  private remoteCallAudioContext: AudioContext | null = null;
  private remoteCallStreamSource: MediaStreamAudioSourceNode | null = null;
  private remoteCallAudioGain: GainNode | null = null;
  private remoteCallAudioCompressor: DynamicsCompressorNode | null = null;
  private remoteCallAudioSource: MediaStreamAudioSourceNode | null = null;
  constructor() {
    effect(() => {
      this.registerStatus.set(this.webPhoneService.registerStatus());
      this.registerMessage.set(this.webPhoneService.registerMessage());
      this.resultMessage.set(this.webPhoneService.resultMessage());
    });
  }
  ngOnInit(): void {
    this.loadRingtoneSettings();
    this.startLiveClock();
    this.loadWebPhoneConfig();
    this.loadCallLogs();
    this.loadPhoneBook();
    this.loadVoicemailMessages();

    this.attachExistingWebPhoneService();

    const autoRegister = this.config.santralWebPhone?.autoRegister === true;

    if (
      autoRegister &&
      this.webPhoneConfigLoaded() &&
      !this.webPhoneService.isConnected()
    ) {
      setTimeout(() => {
        this.connectWebPhone();
      }, 300);
    }
  }

  ngOnDestroy(): void {
    this.stopLiveClock();
    this.stopAllCallTones();
    this.ringbackTone.dispose();
    this.incomingTone.dispose();
    this.busyTone.dispose();
    this.disposeIncomingRingtoneAudio();
    this.disposeRemoteCallAudioGraph();
    this.notificationManager.dispose();
    this.clearFailureToneTimer();
    this.clearResultTimer();

    this.webPhoneService.clearIncomingSessionHandler();
    this.ua = null;
  }

  toggleRingtoneSettings(): void {
    this.ringtoneSettingsOpen.update(value => !value);
  }

  toggleRingtoneBoost(): void {
    this.ringtoneBoostEnabled.update(value => !value);
    this.saveRingtoneSettings();
    this.applyRingtoneGain();
  }

  onRingtoneGainValueChange(value: number | string): void {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    const safeValue = Math.min(4, Math.max(0.5, numericValue));

    this.ringtoneGainValue.set(Number(safeValue.toFixed(1)));
    this.saveRingtoneSettings();
    this.applyRingtoneGain();
  }

  getRingtoneGainLabel(): string {
    const gain = this.ringtoneBoostEnabled() ? this.ringtoneGainValue() : 1;

    return `${gain.toFixed(1)}x`;
  }

  toggleCallVolumeBoost(): void {
    this.callVolumeBoostEnabled.update(value => !value);
    this.saveRingtoneSettings();
    this.applyCallVolumeGain();
  }

  onCallVolumeGainValueChange(value: number | string): void {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    const safeValue = Math.min(3, Math.max(0.1, numericValue));

    this.callVolumeGainValue.set(Number(safeValue.toFixed(1)));
    this.saveRingtoneSettings();
    this.applyCallVolumeGain();
  }

  getCallVolumeGainLabel(): string {
    const gain = this.callVolumeBoostEnabled() ? this.callVolumeGainValue() : 1;

    return `${gain.toFixed(1)}x`;
  }

  previewIncomingRingtone(): void {
    this.startIncomingRingtone();

    setTimeout(() => {
      this.stopIncomingRingtone();
    }, 2500);
  }

  private loadRingtoneSettings(): void {
    try {
      const raw = localStorage.getItem(this.ringtoneSettingsKey);

      if (!raw) {
        return;
      }

      const settings = JSON.parse(raw);

      this.ringtoneBoostEnabled.set(settings?.enabled !== false);
      this.callVolumeBoostEnabled.set(settings?.callEnabled !== false);

      const gain = Number(settings?.gain);

      if (Number.isFinite(gain)) {
        this.ringtoneGainValue.set(Math.min(4, Math.max(0.5, Number(gain.toFixed(1)))));
      }

      const callGain = Number(settings?.callGain);

      if (Number.isFinite(callGain)) {
        this.callVolumeGainValue.set(Math.min(3, Math.max(0.5, Number(callGain.toFixed(1)))));
      }
    } catch {
    }
  }

  private saveRingtoneSettings(): void {
    try {
      localStorage.setItem(
        this.ringtoneSettingsKey,
        JSON.stringify({
          enabled: this.ringtoneBoostEnabled(),
          gain: this.ringtoneGainValue(),
          callEnabled: this.callVolumeBoostEnabled(),
          callGain: this.callVolumeGainValue()
        })
      );
    } catch {
    }
  }


  private cleanText(value: any): string {
    return cleanSantralText(value);
  }

  private loadWebPhoneConfig(): void {
    const webPhoneConfig = this.config.santralWebPhone;

    const wsUrl = this.cleanText(webPhoneConfig?.wsUrl);
    const domain = this.cleanText(webPhoneConfig?.domain);

    const extension = this.cleanText(this.session.manager);
    const password = this.cleanText(this.session.delegacy);

    if (!wsUrl || !domain) {
      this.webPhoneConfigLoaded.set(false);
      this.registerStatus.set('failed');
      this.registerMessage.set('WebPhone config not found');
      return;
    }

    if (!extension || !password) {
      this.webPhoneConfigLoaded.set(false);
      this.registerStatus.set('failed');
      this.registerMessage.set('WebPhone session not found');
      return;
    }

    this.webPhoneWsUrl.set(wsUrl);
    this.webPhoneDomain.set(domain);

    this.webPhoneExtension.set(extension);
    this.webPhonePassword.set(password);
    this.callerExtension.set(extension);

    this.webPhoneConfigLoaded.set(true);
    this.webPhoneService.init({
      wsUrl: this.webPhoneWsUrl(),
      domain: this.webPhoneDomain(),
      extension: this.webPhoneExtension(),
      password: this.webPhonePassword()
    });
    this.registerStatus.set('offline');
    this.registerMessage.set('Config loaded');
  }

  activeLine(): WebPhoneLine {
    return this.lines().find(line => line.index === this.activeLineIndex()) ?? this.lines()[0];
  }

  firstIncomingLine(): WebPhoneLine | null {
    return this.lines().find(line => line.status === 'incoming') ?? null;
  }

  hasAnyActiveSession(): boolean {
    return this.lines().some(line => !!line.session);
  }

  canEditDial(): boolean {
    const activeLine = this.activeLine();

    return (
      !activeLine.session &&
      !this.isCalling() &&
      !this.isHangingUp()
    );
  }
  private getDtmfLine(): WebPhoneLine | null {
    const selectedLine = this.activeLine();

    if (selectedLine?.session && selectedLine.status !== 'held') {
      return selectedLine;
    }

    const activeLine = this.lines().find(line =>
      !!line.session && line.status === 'active'
    );

    if (activeLine) {
      return activeLine;
    }

    const anySessionLine = this.lines().find(line => !!line.session);

    return anySessionLine ?? null;
  }

  canUseKeypad(): boolean {
    return !!this.getDtmfLine() || this.canEditDial();
  }
  canCall(): boolean {
    return (
      !!this.targetNumber() &&
      this.registerStatus() === 'registered' &&
      this.canEditDial()
    );
  }

  canHangup(): boolean {
    const activeLine = this.activeLine();

    return !!activeLine.session && !this.isHangingUp();
  }

  canHold(): boolean {
    const activeLine = this.activeLine();

    return !!activeLine.session && activeLine.status === 'active';
  }

  canResume(): boolean {
    const activeLine = this.activeLine();

    return !!activeLine.session && activeLine.status === 'held';
  }

  canMute(): boolean {
    const activeLine = this.activeLine();

    return !!activeLine.session && (activeLine.status === 'active' || activeLine.status === 'held');
  }

  canTransfer(): boolean {
    const activeLine = this.activeLine();

    return !!activeLine.session && !!this.transferNumber() && activeLine.status !== 'incoming';
  }

  getStatusText(): string {
    const line = this.activeLine();

    if (line.status === 'incoming') {
      return 'تماس ورودی';
    }

    if (line.status === 'active') {
      return 'تماس برقرار است';
    }

    if (line.status === 'held') {
      return 'تماس روی Hold';
    }

    switch (this.callStatus()) {
      case 'calling':
        return 'در حال زنگ خوردن';

      case 'sent':
        return 'تماس برقرار است';

      case 'holding':
        return 'در حالت انتظار';

      case 'hangingup':
        return 'در حال قطع';

      case 'ended':
        return 'پایان تماس';

      case 'busy':
        return 'اشغال';

      case 'noanswer':
        return 'بدون پاسخ';

      case 'rejected':
        return 'رد شد';

      case 'error':
        return 'خطا';

      default:
        return 'آماده تماس';
    }
  }

  getRegisterText(): string {
    switch (this.registerStatus()) {
      case 'connecting':
        return 'در حال اتصال';

      case 'registered':
        return 'متصل';

      case 'failed':
        return 'ناموفق';

      default:
        return 'قطع';
    }
  }

  getLineText(line: WebPhoneLine): string {
    switch (line.status) {
      case 'incoming':
        return 'ورودی';

      case 'dialing':
      case 'ringing':
        return 'زنگ';

      case 'active':
        return line.muted ? 'Mute' : 'فعال';

      case 'held':
        return 'Hold';

      case 'ended':
        return 'پایان';

      case 'failed':
        return 'خطا';

      default:
        return 'آزاد';
    }
  }

  selectLine(index: number): void {
    const current = this.activeLine();
    const next = this.lines().find(line => line.index === index);

    if (!next) {
      return;
    }

    if (current.index === index) {
      return;
    }

    if (current.session && current.status === 'active') {
      this.holdLine(current.index, false);
    }

    this.activeLineIndex.set(index);

    if (next.session && next.status === 'held') {
      this.resumeLine(next.index, false);
    }

    if (next.number) {
      this.targetNumber.set(next.number);
    } else {
      this.targetNumber.set('');
    }

    this.syncCallStatusFromActiveLine();
  }

  pressKey(key: string): void {
    const dtmfLine = this.getDtmfLine();

    if (dtmfLine?.session) {
      this.sendDtmf(dtmfLine, key);
      return;
    }

    if (!this.canEditDial()) {
      return;
    }

    this.targetNumber.update(value => value + key);
    this.callStatus.set('idle');
    this.resultMessage.set('');
  }

  private sendDtmf(line: WebPhoneLine, key: string): void {
    if (!line?.session) {
      return;
    }

    try {
      console.log('DTMF SEND:', key, 'LINE:', line.index, line.number);

      if (typeof line.session.sendDTMF === 'function') {
        line.session.sendDTMF(key, {
          duration: 180,
          interToneGap: 100
        });

        this.resultMessage.set(`کلید ${key} ارسال شد`);
        this.clearResultLater(900);
        return;
      }

      this.resultMessage.set('ارسال کلید در تماس پشتیبانی نمی‌شود');
      this.clearResultLater(1500);
    } catch (error) {
      console.error('DTMF ERROR:', error);
      this.resultMessage.set('ارسال کلید ناموفق بود');
      this.clearResultLater(1500);
    }
  }
  onTargetNumberChange(value: string): void {
    if (!this.canEditDial()) {
      return;
    }

    const cleanValue = this.normalizePhoneValue(value);

    this.targetNumber.set(cleanValue);
    this.targetDialNumber.set('');

    this.callStatus.set('idle');
    this.resultMessage.set('');
  }

  onPhoneBookSearchChange(value: string): void {
    this.phoneBookSearch.set(String(value ?? '').trim());
  }

  onTransferNumberChange(value: string): void {
    this.transferNumber.set(this.normalizePhoneValue(value));
  }

  backspace(): void {
    if (!this.canEditDial()) {
      return;
    }

    this.targetNumber.update(value => value.slice(0, -1));
    this.resultMessage.set('');
  }

  clearNumber(): void {
    if (!this.canEditDial()) {
      return;
    }

    this.targetNumber.set('');
    this.callStatus.set('idle');
    this.resultMessage.set('');
  }

  onEnterCall(event: Event): void {
    event.preventDefault();

    if (!this.canCall()) {
      return;
    }

    this.startCall();
  }

  private normalizePhoneValue(value: string): string {
    return String(value ?? '')
      .trim()
      .replace(/[^\d*#]/g, '');
  }

  connectWebPhone(): void {
    if (!this.webPhoneConfigLoaded()) {
      this.registerStatus.set('failed');
      this.registerMessage.set('Config is not loaded');
      return;
    }

    if (this.webPhoneService.isConnected()) {
      this.attachExistingWebPhoneService();
      return;
    }

    if (
      this.registerStatus() === 'connecting' ||
      this.registerStatus() === 'registered'
    ) {
      return;
    }

    this.notificationManager.requestPermissionIfNeeded();

    this.webPhoneService.setIncomingSessionHandler((session: any) => {
      this.handleIncomingCall(session);
    });

    this.webPhoneService.connect();

    this.ua = this.webPhoneService.getUa();

    this.registerStatus.set(this.webPhoneService.registerStatus());
    this.registerMessage.set(this.webPhoneService.registerMessage());
  }

  disconnectWebPhone(): void {
    this.stopAllCallTones();
    this.webPhoneAudioService.stop();
    this.notificationManager.closeIncomingCall();
    this.notificationManager.closeConnectedCall();

    this.webPhoneService.disconnect();

    this.ua = null;

    this.registerStatus.set(this.webPhoneService.registerStatus());
    this.registerMessage.set(this.webPhoneService.registerMessage());

    this.resultMessage.set('WebPhone disconnected');
  }

  startCall(): void {
    const targetDisplay = this.normalizePhoneValue(this.targetNumber());

    const target = this.targetDialNumber()
      ? this.normalizePhoneValue(this.targetDialNumber())
      : this.toAsteriskDialNumber(targetDisplay);

    const ua = this.ua ?? this.webPhoneService.getUa();

    if (!ua || this.registerStatus() !== 'registered') {
      this.setTemporaryFailure('WebPhone متصل نیست', 'error');
      return;
    }

    this.ua = ua;

    if (!target) {
      this.setTemporaryFailure('شماره مقصد را وارد کنید', 'error');
      return;
    }

    const lineIndex = this.activeLineIndex();
    const activeLine = this.activeLine();

    if (activeLine.session) {
      this.setTemporaryFailure('این Line درگیر تماس است', 'error');
      return;
    }

    this.clearResultTimer();

    this.isCalling.set(true);
    this.callStatus.set('calling');
    this.resultMessage.set('در حال شماره‌گیری...');
    this.startOutgoingCallTone();
    this.prepareCallCustomerContext(targetDisplay, this.findContactName(targetDisplay), lineIndex, 'CALL');

    this.updateLine(lineIndex, {
      status: 'dialing',
      number: targetDisplay,
      name: this.findContactName(targetDisplay),
      direction: 'outgoing',
      muted: false,
      held: false,
      answered: false,
      startedAt: Date.now(),
      connectedAt: null
    });

    const options = {
      mediaConstraints: {
        audio: true,
        video: false
      },
      pcConfig: {
        iceServers: []
      }
    };

    try {
      const callSession = ua.call(
        `sip:${target}@${this.webPhoneDomain()}`,
        options
      );

      this.updateLine(lineIndex, {
        session: callSession
      });

      this.bindSessionEvents(callSession, lineIndex, 'outgoing');
      this.attachRemoteAudio(callSession);

    } catch {
      this.stopAllCallTones();
      this.isCalling.set(false);
      this.clearLine(lineIndex);
      this.setTemporaryFailure('تماس ناموفق بود', 'error');
    }
  }

  private handleIncomingCall(session: any): void {
    const lineIndex = this.findBestLineForIncoming();

    if (!lineIndex) {
      try {
        session.terminate({
          status_code: 486,
          reason_phrase: 'Busy Here'
        });
      } catch { }

      return;
    }

    const remoteIdentity = session?.remote_identity;
    const callerNumber = this.cleanText(remoteIdentity?.uri?.user);
    const phoneBookItem = this.findPhoneBookItem(callerNumber);
    const remoteName = this.cleanCallerDisplayName(remoteIdentity?.display_name, callerNumber);
    const callerName = phoneBookItem?.name || remoteName || callerNumber;

    this.prepareCallCustomerContext(callerNumber, callerName, lineIndex, 'CALL', phoneBookItem);

    this.activeLineIndex.set(lineIndex);

    this.updateLine(lineIndex, {
      session,
      status: 'incoming',
      number: callerNumber,
      name: callerName,
      direction: 'incoming',
      muted: false,
      held: false,
      answered: false,
      startedAt: Date.now(),
      connectedAt: null
    });

    this.callStatus.set('calling');
    this.resultMessage.set('تماس ورودی...');

    this.startIncomingRingtone();
    this.showIncomingCallNotification(lineIndex, callerNumber, callerName);
    this.bindSessionEvents(session, lineIndex, 'incoming');
    this.attachRemoteAudio(session);
  }
  workspaceTab = signal<'phonebook' | 'favorites' | 'logs' | 'voicemail'>('favorites');

  setWorkspaceTab(tab: 'phonebook' | 'favorites' | 'logs' | 'voicemail'): void {
    this.workspaceTab.set(tab);

    if (tab === 'voicemail') {
      this.loadVoicemailMessages();
    }
  }
  answerIncomingCall(lineIndex?: number): void {
    const index = lineIndex ?? this.firstIncomingLine()?.index;

    if (!index) {
      return;
    }

    const line = this.lines().find(item => item.index === index);

    if (!line?.session) {
      return;
    }

    this.stopIncomingRingtone();
    this.notificationManager.closeIncomingCall(index);

    const options = {
      mediaConstraints: {
        audio: true,
        video: false
      },
      pcConfig: {
        iceServers: []
      },
      rtcOfferConstraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      }
    };

    try {
      this.attachRemoteAudio(line.session);
      line.session.answer(options);
      this.stopIncomingRingtone();

      setTimeout(() => {
        this.stopIncomingRingtone();
        this.attachRemoteAudio(line.session);
      }, 300);

      setTimeout(() => {
        this.attachRemoteAudio(line.session);
      }, 1000);
      this.activeLineIndex.set(index);
      this.updateLine(index, {
        status: 'active',
        answered: true,
        held: false,
        connectedAt: Date.now()
      });
      this.callStatus.set('sent');
      this.resultMessage.set('');
    } catch {
      this.finishLine(index, 'error', 'پاسخ به تماس ناموفق بود');
    }
  }

  rejectIncomingCall(lineIndex?: number): void {
    const index = lineIndex ?? this.firstIncomingLine()?.index;

    if (!index) {
      return;
    }

    const line = this.lines().find(item => item.index === index);

    if (!line?.session) {
      return;
    }

    this.notificationManager.closeIncomingCall(index);

    try {
      line.session.terminate({
        status_code: 486,
        reason_phrase: 'Busy Here'
      });
    } catch { }

    this.finishLine(index, 'rejected', 'تماس رد شد');
  }

  endCall(): void {
    const line = this.activeLine();

    if (!line.session) {
      this.callStatus.set('ended');
      this.resultMessage.set('تماسی برای قطع کردن وجود ندارد');
      this.clearResultLater(2500);
      return;
    }

    this.stopAllCallTones();
    this.notificationManager.closeIncomingCall();

    this.isHangingUp.set(true);
    this.callStatus.set('hangingup');
    this.resultMessage.set('در حال قطع تماس...');
    this.clearDialInputs();
    try {
      line.session.terminate();
    } catch { }

    this.finishLine(line.index, 'ended', 'تماس قطع شد');
  }

  toggleHoldActiveLine(): void {
    const line = this.activeLine();

    if (!line.session) {
      return;
    }

    if (line.status === 'held') {
      this.resumeLine(line.index, true);
      return;
    }

    this.holdLine(line.index, true);
  }

  private holdLine(index: number, showMessage: boolean): void {
    const line = this.lines().find(item => item.index === index);

    if (!line?.session) {
      return;
    }

    try {
      line.session.hold();
    } catch { }

    this.updateLine(index, {
      status: 'held',
      held: true
    });

    if (showMessage) {
      this.callStatus.set('holding');
      this.resultMessage.set('تماس روی Hold قرار گرفت');
      this.clearResultLater(1800);
    }
  }

  private resumeLine(index: number, showMessage: boolean): void {
    const line = this.lines().find(item => item.index === index);

    if (!line?.session) {
      return;
    }

    try {
      line.session.unhold();
    } catch { }

    this.updateLine(index, {
      status: 'active',
      held: false
    });

    if (showMessage) {
      this.callStatus.set('sent');
      this.resultMessage.set('تماس برگشت');
      this.clearResultLater(1600);
    }
  }

  toggleMuteActiveLine(): void {
    const line = this.activeLine();

    if (!line.session) {
      return;
    }

    try {
      if (line.muted) {
        line.session.unmute({ audio: true });
        this.updateLine(line.index, { muted: false });
        this.resultMessage.set('میکروفن فعال شد');
      } else {
        line.session.mute({ audio: true });
        this.updateLine(line.index, { muted: true });
        this.resultMessage.set('میکروفن قطع شد');
      }

      this.clearResultLater(1600);

    } catch {
      this.setTemporaryFailure('Mute انجام نشد', 'error');
    }
  }

  transferActiveLine(): void {
    const line = this.activeLine();
    const target = this.normalizePhoneValue(this.transferNumber());

    if (!line.session || !target) {
      return;
    }

    try {
      line.session.refer(`sip:${target}@${this.webPhoneDomain()}`);
      this.resultMessage.set('درخواست انتقال ارسال شد');
      this.showTransferBox.set(false);
      this.transferNumber.set('');
      this.clearResultLater(2500);
    } catch {
      this.setTemporaryFailure('انتقال تماس ناموفق بود', 'error');
    }
  }

  toggleTransferBox(): void {
    this.showTransferBox.update(value => !value);

    if (this.showTransferBox()) {
      this.showConferenceBox.set(false);
    }
  }

  canConference(): boolean {
    const line = this.getDtmfLine();

    return !!line?.session && line.status !== 'incoming' && !this.conferenceLoading();
  }

  toggleConferenceBox(): void {
    if (!this.canConference()) {
      return;
    }

    this.showConferenceBox.update(value => !value);

    if (this.showConferenceBox()) {
      this.showTransferBox.set(false);
    }
  }

  onConferenceNumberChange(value: string): void {
    this.conferenceNumber.set(this.normalizePhoneValue(value));
  }

  startConference(): void {
    const line = this.getDtmfLine();
    const extension = this.cleanText(this.callerExtension() || this.webPhoneExtension());
    const target = this.normalizePhoneValue(this.conferenceNumber());

    if (!line?.session) {
      this.setTemporaryFailure('تماس فعالی برای کنفرانس وجود ندارد', 'error');
      return;
    }

    if (!extension) {
      this.setTemporaryFailure('داخلی شما مشخص نیست', 'error');
      return;
    }

    if (!target) {
      this.setTemporaryFailure('شماره نفر سوم را وارد کنید', 'error');
      return;
    }

    this.conferenceLoading.set(true);
    this.resultMessage.set('در حال ساخت کنفرانس...');

    this.santralApi.StartSantralConference(
      extension,
      target,
      '',
      true
    ).subscribe({
      next: (res: any) => {
        this.conferenceLoading.set(false);

        if (Number(res?.ErrCode ?? 1) !== 0) {
          this.setTemporaryFailure(res?.ErrDesc ?? 'ساخت کنفرانس ناموفق بود', 'error');
          return;
        }

        this.conferenceRoom.set(String(res?.room ?? ''));
        this.showConferenceBox.set(false);
        this.conferenceNumber.set('');
        this.resultMessage.set('کنفرانس ایجاد شد و نفر سوم دعوت شد');
        this.clearResultLater(3000);
      },
      error: () => {
        this.conferenceLoading.set(false);
        this.setTemporaryFailure('ساخت کنفرانس ناموفق بود', 'error');
      }
    });
  }

  pickPhoneBookItem(item: PhoneBookItem): void {
    if (!this.canEditDial()) {
      return;
    }

    this.targetNumber.set(this.normalizePhoneValue(item.number));
    this.targetDialNumber.set(this.normalizePhoneValue(item.dialNumber || item.number));

    this.phoneBookSearch.set(item.name || item.number);
    this.prepareCallCustomerContext(item.number, item.name, undefined, 'PHONEBOOK', item);
  }
  callFromLog(item: CallLogItem): void {
    if (!this.canEditDial()) {
      return;
    }

    this.targetNumber.set(this.normalizePhoneValue(item.number));
  }

  filteredPhoneBook(): PhoneBookItem[] {
    const search = this.cleanText(this.phoneBookSearch()).toLowerCase();

    const list = this.phoneBook();

    if (!search) {
      return list.slice(0, 8);
    }

    return list
      .filter(item => {
        const name = item.name.toLowerCase();
        const number = item.number.toLowerCase();
        const explain = String(item.explain ?? '').toLowerCase();

        return (
          name.includes(search) ||
          number.includes(search) ||
          explain.includes(search)
        );
      })
      .slice(0, 12);
  }

  visibleCallLogs(): CallLogItem[] {
    const filter = this.logFilter();

    return this.callLogs()
      .filter(item => {
        if (filter === 'missed') {
          return item.direction === 'missed';
        }

        if (filter === 'outgoing') {
          return item.direction === 'outgoing';
        }

        return item.direction === 'incoming';
      })
      .slice(0, 8);
  }

  setLogFilter(filter: 'received' | 'missed' | 'outgoing'): void {
    this.logFilter.set(filter);

    if (filter === 'missed') {
      this.markMissedCallsAsSeen();
    }
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

  private bindSessionEvents(session: any, lineIndex: number, direction: 'incoming' | 'outgoing'): void {
    session.on('progress', () => {
      if (direction === 'outgoing') {
        this.updateLine(lineIndex, { status: 'ringing' });
        this.isCalling.set(false);
        this.callStatus.set('calling');
        this.resultMessage.set('در حال زنگ خوردن...');
        this.startOutgoingCallTone();
      }
    });

    session.on('confirmed', () => {
      this.stopAllCallTones();
      this.notificationManager.closeIncomingCall(lineIndex);

      this.isCalling.set(false);
      this.isHangingUp.set(false);

      this.updateLine(lineIndex, {
        status: 'active',
        held: false,
        answered: true,
        connectedAt: Date.now(),
        startedAt: this.lines().find(item => item.index === lineIndex)?.startedAt ?? Date.now()
      });

      this.activeLineIndex.set(lineIndex);
      this.callStatus.set('sent');
      this.resultMessage.set('');
      this.showConnectedCallNotification(lineIndex);
    });

    session.on('ended', () => {
      this.finishLine(lineIndex, 'ended', 'تماس پایان یافت');
    });

    session.on('failed', (event: any) => {
      const failure = this.getFailureInfo(event);
      this.finishLine(lineIndex, failure.status, failure.message);
    });

    session.on('hold', () => {
      this.updateLine(lineIndex, {
        status: 'held',
        held: true
      });
    });

    session.on('unhold', () => {
      this.updateLine(lineIndex, {
        status: 'active',
        held: false
      });
    });

    session.on('muted', () => {
      this.updateLine(lineIndex, {
        muted: true
      });
    });

    session.on('unmuted', () => {
      this.updateLine(lineIndex, {
        muted: false
      });
    });
  }

  private finishLine(lineIndex: number, status: PhoneCallStatus, message: string): void {
    this.stopAllCallTones();
    this.notificationManager.closeIncomingCall(lineIndex);
    this.notificationManager.closeConnectedCall(lineIndex);

    const line = this.lines().find(item => item.index === lineIndex);

    if (!line) {
      return;
    }

    const durationSeconds =
      line.answered && line.connectedAt
        ? Math.max(0, Math.round((Date.now() - line.connectedAt) / 1000))
        : 0;
    if (line.direction === 'incoming') {
      this.addCallLog({
        direction: line.answered ? 'incoming' : 'missed',
        number: line.number,
        name: line.name,
        status: line.answered ? 'received' : 'missed',
        durationSeconds,
        seen: line.answered ? true : false
      });
    }

    if (line.direction === 'outgoing') {
      this.addCallLog({
        direction: 'outgoing',
        number: line.number,
        name: line.name,
        status: line.answered ? 'answered' : status,
        durationSeconds
      });
    }

    this.isCalling.set(false);
    this.isHangingUp.set(false);

    this.updateLine(lineIndex, {
      status: status === 'error' ? 'failed' : 'ended',
      session: null,
      held: false,
      muted: false
    });
    setTimeout(() => {
      const hasLiveSession = this.lines().some(item =>
        !!item.session &&
        item.status !== 'ended' &&
        item.status !== 'failed'
      );

      if (!hasLiveSession) {
        this.resetRemoteAudioOutput();
      }
    }, 0);
    this.callStatus.set(status);
    this.resultMessage.set(message);
    this.playFailureTone(status);

    setTimeout(() => {
      this.clearLine(lineIndex);
      this.syncCallStatusFromActiveLine();
    }, 1200);

    this.clearResultLater(2500);
    this.clearDialInputs();
  }

  private attachRemoteAudio(session: any): void {
    this.webPhoneAudioService.attachSession(session);
    if (!session) {
      this.debugWebPhone('attachRemoteAudio skipped: empty session');
      return;
    }

    if (session.__kowsarAudioBound) {
      this.debugWebPhone('attachRemoteAudio existing session: reattach audio');

      this.bindAudioElementDebug();

      if (session.connection) {
        this.attachPeerConnectionAudio(session.connection, 'existing-session');
      }

      return;
    }

    session.__kowsarAudioBound = true;

    this.bindAudioElementDebug();

    this.debugWebPhone('attachRemoteAudio start', {
      hasConnection: !!session.connection,
      direction: session.direction,
      status: session.status
    });

    session.on('peerconnection', (event: any) => {
      const pc = event?.peerconnection ?? event?.peerConnection ?? session.connection;

      this.debugWebPhone('session peerconnection event', {
        hasPc: !!pc
      });

      if (pc) {
        this.attachPeerConnectionAudio(pc, 'peerconnection-event');
      }
    });

    session.on('connecting', () => {
      this.debugWebPhone('session connecting');
    });

    session.on('progress', () => {
      this.debugWebPhone('session progress');
    });

    session.on('accepted', () => {
      this.debugWebPhone('session accepted');

      if (session.connection) {
        this.attachPeerConnectionAudio(session.connection, 'accepted');
      }
    });

    session.on('confirmed', () => {
      this.debugWebPhone('session confirmed');

      if (session.connection) {
        this.attachPeerConnectionAudio(session.connection, 'confirmed');
      }
    });

    session.on('ended', () => {
      this.debugWebPhone('session ended');
    });

    session.on('failed', (event: any) => {
      this.debugWebPhone('session failed', {
        cause: event?.cause,
        statusCode: event?.message?.status_code
      });
    });

    if (session.connection) {
      this.attachPeerConnectionAudio(session.connection, 'initial');
    }

    setTimeout(() => {
      if (session.connection) {
        this.attachPeerConnectionAudio(session.connection, 'delayed-500ms');
      } else {
        this.debugWebPhone('delayed connection missing');
      }
    }, 500);
  }
  private debugWebPhone(message: string, data?: any): void {
    if (!this.WEBPHONE_DEBUG) {
      return;
    }

    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const line = data
      ? `[${time}] ${message} ${JSON.stringify(data)}`
      : `[${time}] ${message}`;

    console.log('[WEBPHONE]', message, data ?? '');

    this.webPhoneDebug.update(items => [line, ...items].slice(0, 30));
  }

  private getRemoteAudioElement(): HTMLAudioElement | null {
    return this.remoteAudio?.nativeElement ?? null;
  }
  private prepareRemoteCallAudioGraph(stream: MediaStream): void {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      if (!this.remoteCallAudioContext) {
        this.remoteCallAudioContext = new AudioContextClass();

        this.remoteCallAudioSource = null;
        this.remoteCallAudioGain = this.remoteCallAudioContext.createGain();
        this.remoteCallAudioCompressor =
          this.remoteCallAudioContext.createDynamicsCompressor();

        this.remoteCallAudioCompressor.threshold.value = -8;
        this.remoteCallAudioCompressor.knee.value = 16;
        this.remoteCallAudioCompressor.ratio.value = 10;
        this.remoteCallAudioCompressor.attack.value = 0.004;
        this.remoteCallAudioCompressor.release.value = 0.2;

        this.remoteCallAudioGain
          .connect(this.remoteCallAudioCompressor)
          .connect(this.remoteCallAudioContext.destination);
      }

      if (this.remoteCallAudioSource) {
        this.remoteCallAudioSource.disconnect();
        this.remoteCallAudioSource = null;
      }

      // خیلی مهم:
      // اینجا stream صدای دریافتی طرف مقابل است، نه microphone
      this.remoteCallAudioSource =
        this.remoteCallAudioContext.createMediaStreamSource(stream);

      this.remoteCallAudioSource.connect(this.remoteCallAudioGain!);

      this.applyCallVolumeGain();
    } catch (error) {
      this.debugWebPhone('prepareRemoteCallAudioGraph failed', {
        error
      });
    }
  }
  private setRemoteAudioStream(stream: MediaStream, source: string): void {
    const audio = this.getRemoteAudioElement();

    if (!audio) {
      this.debugWebPhone('remote audio element not found');
      this.remoteAudioState.set('audio element not found');
      return;
    }

    const liveAudioTracks = stream
      .getAudioTracks()
      .filter(track => track.readyState === 'live');

    this.debugWebPhone('setRemoteAudioStream requested', {
      source,
      allTracks: stream.getTracks().map(track => ({
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      })),
      liveAudioCount: liveAudioTracks.length
    });

    if (liveAudioTracks.length === 0) {
      this.debugWebPhone('no live audio track, skip attach', { source });
      return;
    }

    const trackId = liveAudioTracks.map(track => track.id).join('|');

    if (this.lastRemoteAudioTrackId === trackId && audio.srcObject) {
      this.debugWebPhone('same remote audio track, skip reattach', {
        source,
        trackId
      });

      this.applyCallVolumeGain();
      return;
    }

    this.lastRemoteAudioTrackId = trackId;

    // این Stream فقط صدای طرف مقابل است
    const remoteOnlyStream = new MediaStream(liveAudioTracks);

    audio.autoplay = true;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.srcObject = remoteOnlyStream;

    // مسیر Boost فقط برای صدای دریافتی / طرف مقابل
    this.prepareRemoteCallAudioGraph(remoteOnlyStream);
    this.applyCallVolumeGain();
    this.resumeRemoteCallAudioContext();

    this.remoteAudioState.set(`stream attached: ${source}`);

    audio.play()
      .then(() => {
        this.debugWebPhone('remote audio play ok');
        this.remoteAudioState.set('playing');
      })
      .catch((err: any) => {
        this.debugWebPhone('remote audio play failed', {
          name: err?.name,
          message: err?.message
        });

        this.remoteAudioState.set(`play failed: ${err?.name ?? 'unknown'}`);
      });
  }
  private resetRemoteAudioOutput(): void {
    const audio = this.getRemoteAudioElement();

    if (audio) {
      audio.pause();
      audio.srcObject = null;
      audio.muted = false;
      audio.volume = 1;
    }

    this.lastRemoteAudioTrackId = '';
    this.disposeRemoteCallAudioGraph();
    this.remoteAudioState.set('idle');
  }
  private attachPeerConnectionAudio(pc: RTCPeerConnection, source: string): void {
    if (this.boundPeerConnections.has(pc)) {
      this.debugWebPhone('peer connection already bound', { source });
      return;
    }

    this.boundPeerConnections.add(pc);

    this.debugWebPhone('attachPeerConnectionAudio', {
      source,
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState
    });

    this.startRemoteAudioStats(pc, source);

    pc.addEventListener('track', (event: RTCTrackEvent) => {
      this.debugWebPhone('pc track event', {
        source,
        trackKind: event.track?.kind,
        streamCount: event.streams?.length ?? 0,
        readyState: event.track?.readyState,
        muted: event.track?.muted
      });

      const stream = event.streams?.[0];

      if (stream) {
        this.setRemoteAudioStream(stream, `track:${source}`);
        return;
      }

      if (event.track && event.track.kind === 'audio') {
        this.setRemoteAudioStream(new MediaStream([event.track]), `track-only:${source}`);
      }
    });

    pc.addEventListener('connectionstatechange', () => {
      this.debugWebPhone('pc connectionstatechange', {
        state: pc.connectionState
      });
    });

    pc.addEventListener('iceconnectionstatechange', () => {
      this.debugWebPhone('pc iceconnectionstatechange', {
        state: pc.iceConnectionState
      });
    });

    setTimeout(() => this.attachAudioFromReceivers(pc, `${source}:500ms`), 500);
    setTimeout(() => this.attachAudioFromReceivers(pc, `${source}:1500ms`), 1500);
  }

  private attachAudioFromReceivers(pc: RTCPeerConnection, source: string): void {
    const receivers = pc.getReceivers ? pc.getReceivers() : [];

    const liveAudioTracks = receivers
      .map(receiver => receiver.track)
      .filter((track): track is MediaStreamTrack =>
        !!track &&
        track.kind === 'audio' &&
        track.readyState === 'live'
      );

    this.debugWebPhone('receiver check', {
      source,
      receiverCount: receivers.length,
      liveAudioTrackCount: liveAudioTracks.length,
      tracks: receivers.map(receiver => receiver.track).filter(Boolean).map((track: any) => ({
        id: track.id,
        kind: track.kind,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState
      }))
    });

    if (liveAudioTracks.length === 0) {
      return;
    }

    this.setRemoteAudioStream(new MediaStream(liveAudioTracks), `receivers:${source}`);
  }

  private bindAudioElementDebug(): void {
    const audio = this.getRemoteAudioElement();

    if (!audio) {
      return;
    }

    audio.onloadedmetadata = () => {
      this.debugWebPhone('audio loadedmetadata', {
        duration: audio.duration,
        paused: audio.paused,
        muted: audio.muted,
        volume: audio.volume
      });
    };

    audio.oncanplay = () => {
      this.debugWebPhone('audio canplay');
    };

    audio.onplaying = () => {
      this.debugWebPhone('audio playing');
      this.remoteAudioState.set('playing');
    };

    audio.onpause = () => {
      this.debugWebPhone('audio paused');
    };

    audio.onerror = () => {
      this.debugWebPhone('audio error', {
        code: audio.error?.code,
        message: audio.error?.message
      });

      this.remoteAudioState.set('audio error');
    };
  }
  private findBestLineForIncoming(): number | null {
    const current = this.activeLine();

    if (!current.session) {
      return current.index;
    }

    const empty = this.lines().find(line => !line.session);

    return empty?.index ?? null;
  }

  private updateLine(index: number, patch: Partial<WebPhoneLine>): void {
    this.lines.update(lines =>
      lines.map(line =>
        line.index === index
          ? { ...line, ...patch }
          : line
      )
    );
  }

  private clearLine(index: number): void {
    this.updateLine(index, this.webPhoneService.createEmptyLine(index));
  }

  private syncCallStatusFromActiveLine(): void {
    const line = this.activeLine();

    if (line.status === 'active') {
      this.callStatus.set('sent');
      return;
    }

    if (line.status === 'held') {
      this.callStatus.set('holding');
      return;
    }

    if (line.status === 'incoming' || line.status === 'ringing') {
      this.callStatus.set('calling');
      return;
    }

    this.callStatus.set('idle');
  }

  private getFailureInfo(event: any): {
    status: PhoneCallStatus;
    message: string;
  } {
    const cause = String(event?.cause ?? '').toLowerCase();

    const statusCode =
      event?.message?.status_code ??
      event?.response?.status_code ??
      event?.data?.status_code ??
      0;

    if (statusCode === 486 || cause.includes('busy')) {
      return {
        status: 'busy',
        message: 'خط مقصد اشغال است'
      };
    }

    if (
      statusCode === 408 ||
      statusCode === 480 ||
      statusCode === 504 ||
      cause.includes('unavailable') ||
      cause.includes('no answer') ||
      cause.includes('timeout')
    ) {
      return {
        status: 'noanswer',
        message: 'مقصد پاسخگو نیست'
      };
    }

    if (
      statusCode === 487 ||
      statusCode === 603 ||
      cause.includes('rejected') ||
      cause.includes('canceled') ||
      cause.includes('cancelled')
    ) {
      return {
        status: 'rejected',
        message: 'تماس رد یا لغو شد'
      };
    }

    return {
      status: 'error',
      message: 'تماس ناموفق بود'
    };
  }

  private setTemporaryFailure(message: string, status: PhoneCallStatus): void {
    this.stopAllCallTones();
    this.callStatus.set(status);
    this.resultMessage.set(message);
    this.playFailureTone(status);
    this.clearResultLater(3500);
  }

  private clearResultLater(ms: number): void {
    this.clearResultTimer();

    this.resultClearTimer = setTimeout(() => {
      this.resultMessage.set('');

      const status = this.callStatus();

      if (
        status === 'error' ||
        status === 'busy' ||
        status === 'noanswer' ||
        status === 'rejected' ||
        status === 'ended'
      ) {
        this.syncCallStatusFromActiveLine();
      }
    }, ms);
  }

  private clearResultTimer(): void {
    if (this.resultClearTimer) {
      clearTimeout(this.resultClearTimer);
      this.resultClearTimer = null;
    }
  }

  private startOutgoingCallTone(): void {
    this.clearFailureToneTimer();
    this.busyTone.stop();
    this.ringbackTone.start();
  }

  private stopRingbackTone(): void {
    this.ringbackTone.stop();
  }

  private startIncomingRingtone(): void {
    this.clearFailureToneTimer();
    this.busyTone.stop();
    this.ringbackTone.stop();
    this.incomingTone.stop();

    this.incomingRingtoneActive = true;
    const runId = ++this.incomingRingtoneRunId;

    const audio = this.getIncomingRingtoneAudio();

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.loop = true;

    this.applyRingtoneGain();
    this.resumeIncomingRingtoneContext();

    audio.play().catch(() => {
      // اگر کاربر قبل از reject شدن play تماس را جواب داد، دیگر beep fallback نباید شروع شود
      if (!this.incomingRingtoneActive || runId !== this.incomingRingtoneRunId) {
        return;
      }

      this.incomingTone.start();
    });
  }

  private getIncomingRingtoneAudio(): HTMLAudioElement {
    if (this.incomingRingtoneAudio) {
      return this.incomingRingtoneAudio;
    }

    const audio = new Audio(this.incomingRingtoneUrl);

    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 1;

    this.incomingRingtoneAudio = audio;

    this.prepareIncomingRingtoneAudioGraph(audio);

    return audio;
  }

  private prepareIncomingRingtoneAudioGraph(audio: HTMLAudioElement): void {
    if (this.incomingRingtoneContext || this.incomingRingtoneSource) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.incomingRingtoneContext = new AudioContextClass();
      this.incomingRingtoneSource = this.incomingRingtoneContext.createMediaElementSource(audio);
      this.incomingRingtoneGain = this.incomingRingtoneContext.createGain();
      this.incomingRingtoneCompressor = this.incomingRingtoneContext.createDynamicsCompressor();

      this.incomingRingtoneCompressor.threshold.value = -10;
      this.incomingRingtoneCompressor.knee.value = 18;
      this.incomingRingtoneCompressor.ratio.value = 12;
      this.incomingRingtoneCompressor.attack.value = 0.003;
      this.incomingRingtoneCompressor.release.value = 0.18;

      this.incomingRingtoneSource
        .connect(this.incomingRingtoneGain)
        .connect(this.incomingRingtoneCompressor)
        .connect(this.incomingRingtoneContext.destination);

      this.applyRingtoneGain();
    } catch {
      this.incomingRingtoneContext = null;
      this.incomingRingtoneSource = null;
      this.incomingRingtoneGain = null;
      this.incomingRingtoneCompressor = null;
    }
  }

  private applyRingtoneGain(): void {
    if (!this.incomingRingtoneGain) {
      return;
    }

    this.incomingRingtoneGain.gain.value = this.ringtoneBoostEnabled()
      ? this.ringtoneGainValue()
      : 1;
  }

  private resumeIncomingRingtoneContext(): void {
    if (this.incomingRingtoneContext?.state === 'suspended') {
      this.incomingRingtoneContext.resume().catch(() => { });
    }
  }



  private applyCallVolumeGain(): void {
    const audio = this.getRemoteAudioElement();

    const enabled = this.callVolumeBoostEnabled();
    const gain = enabled ? this.callVolumeGainValue() : 1;

    // اگر WebAudio آماده است، صدای audio element رو mute می‌کنیم
    // تا صدا دوبار پخش نشه
    if (audio) {
      if (enabled && this.remoteCallAudioGain) {
        audio.muted = true;
        audio.volume = 0;
      } else {
        audio.muted = false;
        audio.volume = Math.min(1, Math.max(0, gain));
      }
    }

    // این فقط روی صدای طرف مقابل اثر می‌گذارد
    if (this.remoteCallAudioGain) {
      this.remoteCallAudioGain.gain.value = enabled ? gain : 0;
    }

    this.debugWebPhone('call volume applied', {
      enabled,
      gain,
      hasRemoteGain: !!this.remoteCallAudioGain,
      audioMuted: audio?.muted,
      audioVolume: audio?.volume,
      audioContextState: this.remoteCallAudioContext?.state
    });
  }

  private resumeRemoteCallAudioContext(): void {
    if (this.remoteCallAudioContext?.state === 'suspended') {
      this.remoteCallAudioContext.resume().catch(() => { });
    }
  }

  private disposeRemoteCallAudioGraph(): void {
    try {
      if (this.remoteCallAudioSource) {
        this.remoteCallAudioSource.disconnect();
        this.remoteCallAudioSource = null;
      }

      if (this.remoteCallAudioGain) {
        this.remoteCallAudioGain.disconnect();
        this.remoteCallAudioGain = null;
      }

      if (this.remoteCallAudioCompressor) {
        this.remoteCallAudioCompressor.disconnect();
        this.remoteCallAudioCompressor = null;
      }

      if (this.remoteCallAudioContext) {
        this.remoteCallAudioContext.close().catch(() => { });
        this.remoteCallAudioContext = null;
      }
    } catch {
    }
  }

  private showIncomingCallNotification(
    lineIndex: number,
    number: string,
    name: string,
    silent = false
  ): void {
    const context = this.callCustomerContext();
    const sameNumber = !context?.number || this.isSamePhoneNumber(context.number, number);

    this.notificationManager.showIncomingCall({
      lineIndex,
      number,
      name,
      customerName: sameNumber ? context?.customerName : undefined,
      explain: sameNumber ? context?.customerExplain : undefined,
      silent
    });
  }

  private showConnectedCallNotification(lineIndex: number): void {
    const line = this.lines().find(item => item.index === lineIndex);
    if (!line) {
      return;
    }

    const context = this.callCustomerContext();
    const sameNumber = !context?.number || this.isSamePhoneNumber(context.number, line.number);

    this.notificationManager.showConnectedCall({
      lineIndex,
      number: line.number,
      name: sameNumber ? (context?.name || line.name) : line.name,
      customerName: sameNumber ? context?.customerName : undefined,
      explain: sameNumber ? context?.customerExplain : undefined,
      centralRef: sameNumber ? context?.centralRef : undefined,
      customerCode: sameNumber ? context?.customerCode : undefined,
      customerType: sameNumber ? context?.customerType : undefined,
      manager: sameNumber ? context?.manager : undefined
    });
  }

  private cleanCallerDisplayName(value: any, number: string): string {
    const name = this.cleanText(value);
    if (!name) {
      return '';
    }

    const normalized = name.toUpperCase();
    if (/^CID\s*:/i.test(name) || normalized === 'UNKNOWN' || normalized === 'ANONYMOUS') {
      return '';
    }

    return name === number ? '' : name;
  }

  private parseKowsarPhonebookExplain(explain: string): { centralRef?: number; customerCode?: number; addressRef?: number } {
    const text = String(explain ?? '').trim();
    if (!text || !/^KOWSAR(?:\||$)/i.test(text)) {
      return {};
    }

    const values: Record<string, number> = {};
    for (const part of text.split('|').slice(1)) {
      const [rawKey, rawValue] = part.split('=', 2);
      const key = String(rawKey ?? '').trim().toLowerCase();
      const value = Number(String(rawValue ?? '').trim());
      if (key && Number.isFinite(value) && value > 0) {
        values[key] = value;
      }
    }

    return {
      centralRef: values['centralref'],
      customerCode: values['customercode'],
      addressRef: values['addressref']
    };
  }

  private prepareCallCustomerContext(
    number: string,
    name: string,
    lineIndex?: number,
    source: 'PHONEBOOK' | 'CALL' | 'MANUAL' = 'CALL',
    knownItem?: PhoneBookItem
  ): void {
    const item = knownItem ?? this.findPhoneBookItem(number);
    const link = item
      ? { centralRef: item.centralRef, customerCode: item.customerCode, addressRef: item.addressRef }
      : {};

    const context: PhoneCustomerContext = {
      lineIndex,
      number: this.normalizePhoneValue(number),
      name: item?.name || name || number,
      explain: item?.explain,
      centralRef: link.centralRef,
      customerCode: link.customerCode,
      addressRef: link.addressRef,
      loading: !!link.centralRef,
      source
    };

    this.callCustomerContext.set(context);
    this.callCustomerContextLoading.set(!!link.centralRef);

    if (link.centralRef) {
      this.loadKowsarCentralProfile(link.centralRef);
    }
  }

  private loadKowsarCentralProfile(centralRef: number): void {
    const requestId = ++this.callCustomerContextRequestId;

    this.kowsarBaseApi.GetCustomerByCodeFromSantral(centralRef + "").subscribe({
      next: (res: any) => {
        if (requestId !== this.callCustomerContextRequestId) {
          return;
        }

        this.callCustomerContextLoading.set(false);

        const current = this.callCustomerContext();
        if (!current || Number(current.centralRef ?? 0) !== centralRef) {
          return;
        }

        const customers = Array.isArray(res?.Customers) ? res.Customers : [];
        const customer = customers[0] ?? {};

        const customerName = this.cleanText(customer?.CustName_Small ?? '');
        const updated: PhoneCustomerContext = {
          ...current,
          loading: false,
          customerName,
          centralName: customerName || current.centralName,
          name: current.name,
          customerExplain: this.cleanText(customer?.Explain ?? ''),
          appNumber: this.cleanText(customer?.AppNumber ?? ''),
          databaseNumber: this.cleanText(customer?.DatabaseNumber ?? ''),
          lockNumber: this.cleanText(customer?.lockNumber ?? customer?.LockNumber ?? '')
        };

        this.callCustomerContext.set(updated);

        if (updated.lineIndex) {
          const line = this.lines().find(item => item.index === updated.lineIndex);

          if (line?.status === 'incoming' || line?.status === 'ringing') {
            this.showIncomingCallNotification(
              updated.lineIndex,
              line.number,
              updated.name || line.name,
              true
            );
          } else if (line?.status === 'active' || line?.status === 'held') {
            this.showConnectedCallNotification(updated.lineIndex);
          }
        }
      },
      error: () => {
        if (requestId !== this.callCustomerContextRequestId) {
          return;
        }

        this.callCustomerContextLoading.set(false);
        this.callCustomerContext.update(current => current
          ? { ...current, loading: false }
          : current
        );
      }
    });
  }

  private restoreCallCustomerContextFromActiveLine(): void {
    const line = this.lines().find(item => !!item.session && !!item.number);
    if (!line) {
      return;
    }

    const current = this.callCustomerContext();
    if (current?.number && this.isSamePhoneNumber(current.number, line.number)) {
      return;
    }

    const item = this.findPhoneBookItem(line.number);
    this.prepareCallCustomerContext(
      line.number,
      item?.name || line.name || line.number,
      line.index,
      'CALL',
      item
    );
  }

  private isSamePhoneNumber(first: string, second: string): boolean {
    const a = this.normalizePhoneValue(first);
    const b = this.normalizePhoneValue(second);
    if (!a || !b) {
      return false;
    }
    return a === b || (a.length >= 8 && b.length >= 8 && a.slice(-8) === b.slice(-8));
  }

  clearCallCustomerContext(): void {
    this.callCustomerContextRequestId++;
    this.callCustomerContextLoading.set(false);
    this.callCustomerContext.set(null);
  }

  createTicketForCurrentCustomer(): void {
    const context = this.callCustomerContext();
    if (!context?.centralRef) {
      return;
    }

    this.navigatePanelRoute(['/automation/insert-letter'], {
      source: 'SANTRAL',
      centralRef: context.centralRef,
      centralName: context.centralName || context.name,
      phone: context.number
    });
  }

  createFactorForCurrentCustomer(): void {
    const context = this.callCustomerContext();
    if (!context?.customerCode) {
      return;
    }

    this.navigatePanelRoute(['/internal/internal-factors-edit'], {
      source: 'SANTRAL',
      customerCode: context.customerCode,
      customerName: context.centralName || context.name,
      centralRef: context.centralRef || '',
      phone: context.number
    });
  }

  openCurrentCustomerFactors(): void {
    const context = this.callCustomerContext();
    if (!context?.customerCode) {
      return;
    }

    this.navigatePanelRoute(['/internal/internal-customer-list'], {
      source: 'SANTRAL',
      customerCode: context.customerCode,
      centralRef: context.centralRef || '',
      action: 'factors'
    });
  }

  openCurrentCustomerProperties(): void {
    const context = this.callCustomerContext();
    if (!context?.customerCode) {
      return;
    }

    this.navigatePanelRoute(['/internal/internal-customer-list'], {
      source: 'SANTRAL',
      customerCode: context.customerCode,
      centralRef: context.centralRef || '',
      action: 'properties'
    });
  }

  isCustomerCallActive(): boolean {
    const context = this.callCustomerContext();
    if (!context?.lineIndex) {
      return false;
    }

    const line = this.lines().find(item => item.index === context.lineIndex);
    return line?.status === 'incoming' || line?.status === 'ringing' || line?.status === 'active' || line?.status === 'held';
  }

  private navigatePanelRoute(commands: any[], queryParams: Record<string, any>): void {
    void this.router.navigate(commands, { queryParams });
  }

  private stopIncomingRingtone(): void {
    this.incomingRingtoneActive = false;
    this.incomingRingtoneRunId++;

    this.incomingTone.stop();

    if (!this.incomingRingtoneAudio) {
      return;
    }

    this.incomingRingtoneAudio.pause();
    this.incomingRingtoneAudio.currentTime = 0;
  }

  private stopAllCallTones(): void {
    this.clearFailureToneTimer();
    this.ringbackTone.stop();
    this.stopIncomingRingtone();
    this.busyTone.stop();
  }

  private playFailureTone(status: PhoneCallStatus): void {
    if (
      status !== 'busy' &&
      status !== 'noanswer' &&
      status !== 'rejected' &&
      status !== 'error'
    ) {
      return;
    }

    this.clearFailureToneTimer();
    this.ringbackTone.stop();
    this.stopIncomingRingtone();

    this.busyTone.start();
    this.failureToneTimer = setTimeout(() => {
      this.busyTone.stop();
      this.failureToneTimer = null;
    }, status === 'busy' ? 1700 : 900);
  }

  private disposeIncomingRingtoneAudio(): void {
    this.stopIncomingRingtone();

    if (this.incomingRingtoneContext) {
      this.incomingRingtoneContext.close().catch(() => { });
    }

    this.incomingRingtoneAudio = null;
    this.incomingRingtoneContext = null;
    this.incomingRingtoneSource = null;
    this.incomingRingtoneGain = null;
    this.incomingRingtoneCompressor = null;
  }

  private clearFailureToneTimer(): void {
    if (this.failureToneTimer) {
      clearTimeout(this.failureToneTimer);
      this.failureToneTimer = null;
    }
  }

  loadPhoneBook(): void {
    const extension = this.callerExtension();


    this.santralApi.GetPhoneBook(extension, false)
      .subscribe({
        next: (res: any) => {

          const list =
            Array.isArray(res?.phonebook) ? res.phonebook :
              Array.isArray(res?.items) ? res.items :
                Array.isArray(res?.records) ? res.records :
                  [];

          const mapped = list
            .map((row: any) => {
              const displayNumber = this.cleanText(
                row?.display_number ??
                row?.DisplayNumber ??
                row?.Number ??
                row?.number
              );

              const dialNumber = this.cleanText(
                row?.dial_number ??
                row?.DialNumber ??
                displayNumber
              );

              const name = this.cleanText(
                row?.Name ??
                row?.name ??
                displayNumber
              );

              const explain = this.cleanText(row?.Explain ?? row?.explain ?? '');
              const link = this.parseKowsarPhonebookExplain(explain);

              return {
                id: Number(row?.Id ?? row?.id ?? 0),
                name,
                number: displayNumber,
                dialNumber,
                extension: '',
                explain,
                centralRef: link.centralRef,
                customerCode: link.customerCode,
                addressRef: link.addressRef,
                isFavorite: Number(row?.IsFavorite ?? row?.is_favorite ?? 0) === 1,
                favoriteId: Number(row?.FavoriteId ?? row?.favorite_id ?? 0)
              } as PhoneBookItem;
            })
            .filter((item: PhoneBookItem) => !!item.number);


          this.phoneBook.set(mapped);
          this.refreshContactNamesFromPhoneBook();
          this.restoreCallCustomerContextFromActiveLine();
        },
        error: (err: any) => {
          console.error('PHONEBOOK ERROR:', err);
          this.phoneBook.set([]);
        }
      });
  }


  loadVoicemailMessages(): void {
    const extension = this.webPhoneExtension() || this.callerExtension();

    if (!extension) {
      this.voicemailMessages.set([]);
      return;
    }

    this.voicemailLoading.set(true);

    this.santralApi.GetSantralVoicemailMessages(extension, false)
      .subscribe({
        next: (res: any) => {
          this.voicemailLoading.set(false);

          if (Number(res?.ErrCode ?? 1) !== 0) {
            this.voicemailMessages.set([]);
            this.resultMessage.set(res?.ErrDesc ?? 'دریافت پیام‌های صوتی ناموفق بود');
            this.clearResultLater(2500);
            return;
          }

          const messages = Array.isArray(res?.messages) ? res.messages : [];

          const mappedMessages = messages.map((msg: any) => ({
            ...msg,
            caller_name: this.findContactName(String(msg?.caller_number || '')),
            play_url: this.santralApi.SantralVoicemail_PlayUrl(
              msg.extension,
              msg.folder,
              msg.message_no,
              msg.context || 'default'
            )
          }));

          this.voicemailMessages.set(mappedMessages);
        },
        error: () => {
          this.voicemailLoading.set(false);
          this.voicemailMessages.set([]);
          this.resultMessage.set('دریافت پیام‌های صوتی ناموفق بود');
          this.clearResultLater(2500);
        }
      });
  }

  private refreshContactNamesFromPhoneBook(): void {
    let logsChanged = false;

    this.callLogs.update(list => list.map(log => {
      const contactName = this.findContactName(log.number);

      if (!contactName || contactName === log.name) {
        return log;
      }

      logsChanged = true;
      return { ...log, name: contactName };
    }));

    this.voicemailMessages.update(list => list.map(msg => {
      const contactName = this.findContactName(String(msg?.caller_number || ''));

      return contactName
        ? { ...msg, caller_name: contactName }
        : msg;
    }));

    if (logsChanged) {
      this.saveCallLogs();
    }
  }


  private findContactName(number: string): string {
    return this.findPhoneBookItem(number)?.name ?? '';
  }

  private findPhoneBookItem(number: string): PhoneBookItem | undefined {
    const cleanNumber = this.normalizePhoneValue(number);

    if (!cleanNumber) {
      return undefined;
    }

    return this.phoneBook().find(item => {
      const itemNumber = this.normalizePhoneValue(item.number);

      if (!itemNumber) {
        return false;
      }

      if (itemNumber === cleanNumber) {
        return true;
      }

      return itemNumber.length >= 8 && cleanNumber.length >= 8
        ? itemNumber.slice(-8) === cleanNumber.slice(-8)
        : false;
    });
  }

  private getLogsStorageKey(): string {
    return `kws_webphone_logs_${this.callerExtension() || 'default'}`;
  }

  private loadCallLogs(): void {
    try {
      const raw = localStorage.getItem(this.getLogsStorageKey());

      if (!raw) {
        this.callLogs.set([]);
        return;
      }

      const parsed = JSON.parse(raw);

      this.callLogs.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.callLogs.set([]);
    }
  }

  private saveCallLogs(): void {
    try {
      localStorage.setItem(
        this.getLogsStorageKey(),
        JSON.stringify(this.callLogs().slice(0, 100))
      );
    } catch { }
  }

  private addCallLog(data: {
    direction: CallDirection;
    number: string;
    name: string;
    status: string;
    durationSeconds: number;
    seen?: boolean;
  }): void {
    const item: CallLogItem = {
      id: `${Date.now()}-${Math.random()}`,
      direction: data.direction,
      number: data.number,
      name: data.name || this.findContactName(data.number),
      status: data.status,
      startedAt: Date.now(),
      durationSeconds: data.durationSeconds,
      seen: data.seen ?? true
    };

    this.callLogs.update(list => [item, ...list].slice(0, 100));
    this.saveCallLogs();
  }
  togglePhoneBookFavorite(item: PhoneBookItem, event?: Event): void {
    event?.stopPropagation();

    const extension = this.webPhoneExtension();

    if (!extension) {
      this.resultMessage.set('Extension not found');
      return;
    }

    if (item.isFavorite && item.favoriteId > 0) {
      this.santralApi.DeleteWebPhoneFavorite(extension, item.favoriteId, true)
        .subscribe({
          next: (res: any) => {
            if (Number(res?.ErrCode ?? 1) !== 0) {
              this.resultMessage.set(res?.ErrDesc ?? 'Delete favorite failed');
              return;
            }

            this.phoneBook.update(items =>
              items.map(x =>
                x.id === item.id
                  ? { ...x, isFavorite: false, favoriteId: 0 }
                  : x
              )
            );
          },
          error: () => {
            this.resultMessage.set('Delete favorite failed');
          }
        });

      return;
    }

    this.santralApi.SaveWebPhoneFavorite(extension, item.id, true)
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode ?? 1) !== 0) {
            this.resultMessage.set(res?.ErrDesc ?? 'Save favorite failed');
            return;
          }

          this.loadPhoneBook();
        },
        error: () => {
          this.resultMessage.set('Save favorite failed');
        }
      });
  }
  favoritePhoneBook(): PhoneBookItem[] {
    const search = this.cleanText(this.phoneBookSearch()).toLowerCase();

    return this.phoneBook()
      .filter(item => item.isFavorite)
      .filter(item => {
        if (!search) {
          return true;
        }

        const text = `${item.name} ${item.number} ${item.explain ?? ''}`.toLowerCase();

        return text.includes(search);
      });
  }
  private toAsteriskDialNumber(value: string): string {
    let number = this.normalizePhoneValue(value);

    if (!number) {
      return '';
    }

    if (/^[0-9]{2,8}$/.test(number)) {
      return number;
    }

    if (/^90[0-9]{10}$/.test(number)) {
      return number;
    }

    if (/^9[0-9]{9}$/.test(number)) {
      number = `0${number}`;
    }

    if (/^0[0-9]{10,14}$/.test(number)) {
      return `9${number}`;
    }

    return number;
  }
  private clearDialInputs(): void {
    this.targetNumber.set('');
    this.targetDialNumber.set('');
    this.phoneBookSearch.set('');
  }



  private readonly WEBPHONE_DEBUG = false;


  private boundPeerConnections = new WeakSet<RTCPeerConnection>();
  private remoteAudioStatsTimer: any = null;
  private lastRemoteAudioTrackId = '';

  private startRemoteAudioStats(pc: RTCPeerConnection, source: string): void {
    if (!this.WEBPHONE_DEBUG) {
      return;
    }
    if (this.remoteAudioStatsTimer) {
      clearInterval(this.remoteAudioStatsTimer);
      this.remoteAudioStatsTimer = null;
    }

    this.lastRemoteAudioTrackId = '';

    const audio = this.getRemoteAudioElement();

    if (audio) {
      audio.pause();
      audio.srcObject = null;
    }

    this.remoteAudioStatsTimer = setInterval(async () => {
      try {
        const stats = await pc.getStats();

        stats.forEach((report: any) => {
          if (
            report.type === 'inbound-rtp' &&
            (report.kind === 'audio' || report.mediaType === 'audio')
          ) {
            this.debugWebPhone('audio inbound stats', {
              source,
              packetsReceived: report.packetsReceived,
              bytesReceived: report.bytesReceived,
              packetsLost: report.packetsLost,
              jitter: report.jitter,
              audioLevel: report.audioLevel,
              totalAudioEnergy: report.totalAudioEnergy,
              totalSamplesDuration: report.totalSamplesDuration
            });
          }

          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            this.debugWebPhone('ice candidate pair', {
              source,
              currentRoundTripTime: report.currentRoundTripTime,
              availableIncomingBitrate: report.availableIncomingBitrate,
              bytesReceived: report.bytesReceived,
              bytesSent: report.bytesSent
            });
          }
        });
      } catch (err: any) {
        this.debugWebPhone('getStats failed', {
          name: err?.name,
          message: err?.message
        });
      }
    }, 2000);
  }
  private startLiveClock(): void {
    if (this.liveClockTimer) {
      return;
    }

    this.liveClockTimer = setInterval(() => {
      this.nowTick.set(Date.now());
    }, 1000);
  }
  private stopLiveClock(): void {
    if (!this.liveClockTimer) {
      return;
    }

    clearInterval(this.liveClockTimer);
    this.liveClockTimer = null;
  }
  getActiveCallDurationText(): string {
    const line = this.activeLine();

    if (!line) {
      return '00:00';
    }

    if (line.status !== 'active' && line.status !== 'held') {
      return '00:00';
    }

    if (!line.connectedAt) {
      return '00:00';
    }

    const seconds = Math.max(
      0,
      Math.floor((this.nowTick() - line.connectedAt) / 1000)
    );

    return secondsToClock(seconds);
  }
  missedCallBadgeCount(): number {
    return this.callLogs()
      .filter(item => item.direction === 'missed' && (item as any).seen !== true)
      .length;
  }
  private markMissedCallsAsSeen(): void {
    this.callLogs.update(list =>
      list.map(item =>
        item.direction === 'missed'
          ? { ...item, seen: true }
          : item
      )
    );

    this.saveCallLogs();
  }
  canInstallPwa(): boolean {
    return this.pwaInstallService.canInstall() && !this.pwaInstallService.isInstalled();
  }
  installPwa(): void {
    this.pwaInstallService.install()
      .then(installed => {
        if (installed) {
          this.resultMessage.set('App installed');
          return;
        }

        this.resultMessage.set('Install canceled');
      })
      .catch(() => {
        this.resultMessage.set('Install failed');
      });
  }
  private attachExistingWebPhoneService(): void {
    if (!this.webPhoneService.isConnected()) {
      return;
    }

    this.webPhoneService.setIncomingSessionHandler((session: any) => {
      this.handleIncomingCall(session);
    });

    this.ua = this.webPhoneService.getUa();

    this.registerStatus.set(this.webPhoneService.registerStatus());
    this.registerMessage.set(this.webPhoneService.registerMessage());

    const activeLine = this.activeLine();

    if (activeLine?.number) {
      this.targetNumber.set(activeLine.number);
      this.restoreCallCustomerContextFromActiveLine();
    }

    this.lines()
      .filter(line => !!line.session)
      .forEach(line => {
        this.attachRemoteAudio(line.session);
      });

    this.syncCallStatusFromActiveLine();
  }
  deleteVoicemailMessage(msg: any): void {
    if (!msg?.extension || !msg?.folder || !msg?.message_no) {
      this.resultMessage.set('اطلاعات پیام صوتی کامل نیست');
      return;
    }

    const ok = confirm('آیا از حذف این پیام صوتی مطمئن هستید؟');

    if (!ok) {
      return;
    }

    this.santralApi.SantralVoicemail_Delete(
      msg.extension,
      msg.folder,
      msg.message_no,
      msg.context || 'default',
      true
    ).subscribe({
      next: (res: any) => {
        if (Number(res?.ErrCode ?? 1) !== 0) {
          this.resultMessage.set(res?.ErrDesc ?? 'حذف پیام صوتی ناموفق بود');
          return;
        }

        this.resultMessage.set('پیام صوتی حذف شد');
        this.loadVoicemailMessages();
      },
      error: () => {
        this.resultMessage.set('حذف پیام صوتی ناموفق بود');
      }
    });
  }
  moveVoicemailToOld(msg: any): void {
    if (!msg?.extension || !msg?.folder || !msg?.message_no) {
      this.resultMessage.set('اطلاعات پیام صوتی کامل نیست');
      return;
    }

    if (msg.folder !== 'INBOX') {
      this.resultMessage.set('این پیام قبلاً خوانده شده است');
      return;
    }

    this.santralApi.SantralVoicemail_MoveToOld(
      msg.extension,
      msg.folder,
      msg.message_no,
      msg.context || 'default',
      true
    ).subscribe({
      next: (res: any) => {
        if (Number(res?.ErrCode ?? 1) !== 0) {
          this.resultMessage.set(res?.ErrDesc ?? 'انتقال پیام ناموفق بود');
          return;
        }

        this.resultMessage.set('پیام به خوانده‌شده منتقل شد');
        this.loadVoicemailMessages();
      },
      error: () => {
        this.resultMessage.set('انتقال پیام ناموفق بود');
      }
    });
  }


}
