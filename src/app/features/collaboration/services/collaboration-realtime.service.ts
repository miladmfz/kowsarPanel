import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

export interface CollaborationPostChanged { roomCode: number; postCode: number; }
export interface CollaborationNotificationChanged { roomCode: number; postCode: number; }
export type CollaborationConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

@Injectable({ providedIn: 'root' })
export class CollaborationRealtimeService {
  private readonly config = inject(AppConfigService);
  private readonly session = inject(SessionStorageService);
  private connection?: signalR.HubConnection;
  private currentRoom?: number;
  private starting?: Promise<void>;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private intentionallyClosed = false;
  private readonly stateSubject = new BehaviorSubject<CollaborationConnectionState>('disconnected');
  readonly state$ = this.stateSubject.asObservable();
  private readonly postChangedSubject = new Subject<CollaborationPostChanged>();
  readonly postChanged$ = this.postChangedSubject.asObservable();
  private readonly typingSubject = new Subject<{ roomCode: number; displayName: string; isTyping: boolean }>();
  readonly typing$ = this.typingSubject.asObservable();
  private readonly unreadSubject = new Subject<{ roomCode: number; postCode: number }>();
  readonly unreadChanged$ = this.unreadSubject.asObservable();
  private readonly reminderSubject = new Subject<{ reminderCode: number; postCode: number }>();
  readonly reminderDue$ = this.reminderSubject.asObservable();
  private readonly notificationSubject = new Subject<CollaborationNotificationChanged>();
  readonly notificationCreated$ = this.notificationSubject.asObservable();
  private readonly roomChangedSubject = new Subject<{ roomCode: number }>();
  readonly roomChanged$ = this.roomChangedSubject.asObservable();

  async connect(): Promise<void> {
    await this.ensureConnected();
  }

  async openRoom(roomCode: number): Promise<void> {
    const previousRoom = this.currentRoom;
    this.currentRoom = roomCode;
    await this.ensureConnected();
    if (previousRoom && previousRoom !== roomCode) await this.connection?.invoke('LeaveRoom', previousRoom);
    await this.connection?.invoke('JoinRoom', roomCode);
  }

  async typing(roomCode: number, isTyping: boolean): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected)
      await this.connection.invoke('Typing', roomCode, isTyping);
  }

  async close(): Promise<void> {
    this.intentionallyClosed = true;
    this.clearRetry();
    if (this.connection) await this.connection.stop();
    this.connection = undefined;
    this.currentRoom = undefined;
    this.starting = undefined;
    this.stateSubject.next('disconnected');
  }

  private hubUrl(): string {
    const api = this.config.apiUrl.replace(/\/+$/, '');
    return /\/api$/i.test(api) ? `${api.replace(/\/api$/i, '')}/hubs/collaboration` : `${api}/hubs/collaboration`;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl(), { accessTokenFactory: () => this.session.accessToken, withCredentials: false })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();
      this.connection.on('PostCreated', raw => this.postChangedSubject.next({
        roomCode: Number(raw?.roomCode ?? raw?.RoomCode), postCode: Number(raw?.postCode ?? raw?.PostCode)
      }));
      this.connection.on('TypingChanged', raw => this.typingSubject.next({
        roomCode: Number(raw?.roomCode ?? raw?.RoomCode),
        displayName: String(raw?.displayName ?? raw?.DisplayName ?? 'کاربر'),
        isTyping: Boolean(raw?.isTyping ?? raw?.IsTyping)
      }));
      this.connection.on('RoomUnreadChanged', raw => this.unreadSubject.next({
        roomCode: Number(raw?.roomCode ?? raw?.RoomCode), postCode: Number(raw?.postCode ?? raw?.PostCode)
      }));
      this.connection.on('ReminderDue', raw => this.reminderSubject.next({
        reminderCode: Number(raw?.reminderCode ?? raw?.ReminderCode), postCode: Number(raw?.postCode ?? raw?.PostCode)
      }));
      this.connection.on('NotificationCreated', raw => this.notificationSubject.next({
        roomCode: Number(raw?.roomCode ?? raw?.RoomCode), postCode: Number(raw?.postCode ?? raw?.PostCode)
      }));
      this.connection.on('RoomChanged', raw => this.roomChangedSubject.next({
        roomCode: Number(raw?.roomCode ?? raw?.RoomCode)
      }));
      this.connection.onreconnecting(() => this.stateSubject.next('reconnecting'));
      this.connection.onreconnected(() => {
        this.stateSubject.next('connected');
        if (this.currentRoom) void this.connection?.invoke('JoinRoom', this.currentRoom);
      });
      this.connection.onclose(() => {
        this.stateSubject.next('disconnected');
        this.scheduleRetry();
      });
    }
    if (this.connection.state === signalR.HubConnectionState.Connected) return;
    if (this.starting) return this.starting;
    if (this.connection.state !== signalR.HubConnectionState.Disconnected) return;

    this.intentionallyClosed = false;
    this.stateSubject.next('connecting');
    this.starting = this.connection.start()
      .then(() => {
        this.clearRetry();
        this.stateSubject.next('connected');
      })
      .catch(error => {
        this.stateSubject.next('disconnected');
        this.scheduleRetry();
        throw error;
      })
      .finally(() => this.starting = undefined);
    return this.starting;
  }

  private scheduleRetry(): void {
    if (this.intentionallyClosed || this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      void this.ensureConnected()
        .then(() => this.currentRoom ? this.connection?.invoke('JoinRoom', this.currentRoom) : undefined)
        .catch(() => undefined);
    }, 5000);
  }

  private clearRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
  }
}
