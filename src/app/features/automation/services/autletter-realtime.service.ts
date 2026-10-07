import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

export interface ConversationChangedEvent {
  LetterRef: number;
  ConversationCode: number;
  SenderCentralRef: number;
  SenderUserRef: number | null;
  EventType: 'insert' | 'edit' | 'delete' | string;
  Message: any | null;
}

export interface SeenChangedEvent {
  LetterRef: number;
  CentralRef: number;
  UserRef: number;
  DisplayName: string;
  LastSeenConversationCode: number | null;
  LastSeenDate: string | null;
}

export interface TypingChangedEvent {
  LetterRef: number;
  CentralRef: number;
  UserRef: number;
  DisplayName: string;
  IsTyping: boolean;
}

export interface OnlineTicketUser {
  CentralRef: number;
  UserRef: number;
  DisplayName: string;
  ConnectionCount: number;
}

export interface TicketPresenceChangedEvent {
  LetterRef: number;
  Users: OnlineTicketUser[];
}

export interface TicketUnreadChangedEvent {
  LetterRef: number;
  ConversationCode: number;
  SenderCentralRef: number;
  SenderUserRef: number | null;
}

interface RuntimeSignalRConfig {
  enabled?: boolean;
  hubUrl?: string;
  withCredentials?: boolean;
  logLevel?: string;
  reconnectDelays?: number[];
}

@Injectable({ providedIn: 'root' })
export class AutletterRealtimeService {
  private readonly config = inject(AppConfigService);
  private readonly session = inject(SessionStorageService);

  private connection?: signalR.HubConnection;
  private currentLetterRef?: number;
  private starting?: Promise<void>;

  private readonly conversationChangedSubject = new Subject<ConversationChangedEvent>();
  readonly conversationChanged$ = this.conversationChangedSubject.asObservable();

  private readonly seenChangedSubject = new Subject<SeenChangedEvent>();
  readonly seenChanged$ = this.seenChangedSubject.asObservable();

  private readonly typingChangedSubject = new Subject<TypingChangedEvent>();
  readonly typingChanged$ = this.typingChangedSubject.asObservable();

  private readonly presenceChangedSubject = new Subject<TicketPresenceChangedEvent>();
  readonly presenceChanged$ = this.presenceChangedSubject.asObservable();

  private readonly ticketUnreadChangedSubject = new Subject<TicketUnreadChangedEvent>();
  readonly ticketUnreadChanged$ = this.ticketUnreadChangedSubject.asObservable();

  private readonly stateSubject = new BehaviorSubject<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );
  readonly state$ = this.stateSubject.asObservable();

  private get signalRConfig(): RuntimeSignalRConfig {
    return ((this.config as any)?.signalR ?? {}) as RuntimeSignalRConfig;
  }

  private getHubUrl(): string {
    const configuredHubUrl = this.signalRConfig.hubUrl?.trim();

    if (configuredHubUrl) {
      return configuredHubUrl.replace(/\/+$/, '');
    }

    // Fallback for old configs without signalR.hubUrl
    const api = String((this.config as any)?.apiUrl ?? '').replace(/\/+$/, '');

    if (!api) {
      throw new Error('SignalR Hub URL cannot be resolved because apiUrl is empty.');
    }

    if (/\/api$/i.test(api)) {
      return `${api.replace(/\/api$/i, '')}/hubs/autletter`;
    }

    return `${api}/hubs/autletter`;
  }

  private getReconnectDelays(): number[] {
    const delays = this.signalRConfig.reconnectDelays;

    if (Array.isArray(delays) && delays.length > 0) {
      return delays
        .map(x => Number(x))
        .filter(x => Number.isFinite(x) && x >= 0);
    }

    return [0, 2000, 5000, 10000, 30000];
  }

  private getLogLevel(): signalR.LogLevel {
    switch ((this.signalRConfig.logLevel ?? 'Warning').toLowerCase()) {
      case 'none':
        return signalR.LogLevel.None;
      case 'critical':
        return signalR.LogLevel.Critical;
      case 'error':
        return signalR.LogLevel.Error;
      case 'information':
        return signalR.LogLevel.Information;
      case 'debug':
        return signalR.LogLevel.Debug;
      case 'trace':
        return signalR.LogLevel.Trace;
      case 'warning':
      default:
        return signalR.LogLevel.Warning;
    }
  }

  private n(raw: any, camel: string, pascal: string): any {
    return raw?.[camel] ?? raw?.[pascal];
  }

  private buildConnection(): signalR.HubConnection {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        withCredentials: this.signalRConfig.withCredentials ?? false,
        accessTokenFactory: () => this.session.accessToken
      })
      .withAutomaticReconnect(this.getReconnectDelays())
      .configureLogging(this.getLogLevel())
      .build();

    connection.on('ConversationChanged', (raw: any) => {
      this.conversationChangedSubject.next({
        LetterRef: Number(this.n(raw, 'letterRef', 'LetterRef') ?? 0),
        ConversationCode: Number(this.n(raw, 'conversationCode', 'ConversationCode') ?? 0),
        SenderCentralRef: Number(this.n(raw, 'senderCentralRef', 'SenderCentralRef') ?? 0),
        SenderUserRef: this.n(raw, 'senderUserRef', 'SenderUserRef') == null
          ? null
          : Number(this.n(raw, 'senderUserRef', 'SenderUserRef')),
        EventType: String(this.n(raw, 'eventType', 'EventType') ?? ''),
        Message: this.n(raw, 'message', 'Message') ?? null
      });
    });

    connection.on('SeenChanged', (raw: any) => {
      this.seenChangedSubject.next({
        LetterRef: Number(this.n(raw, 'letterRef', 'LetterRef') ?? 0),
        CentralRef: Number(this.n(raw, 'centralRef', 'CentralRef') ?? 0),
        UserRef: Number(this.n(raw, 'userRef', 'UserRef') ?? 0),
        DisplayName: String(this.n(raw, 'displayName', 'DisplayName') ?? 'کاربر'),
        LastSeenConversationCode: this.n(raw, 'lastSeenConversationCode', 'LastSeenConversationCode') == null
          ? null
          : Number(this.n(raw, 'lastSeenConversationCode', 'LastSeenConversationCode')),
        LastSeenDate: this.n(raw, 'lastSeenDate', 'LastSeenDate') == null
          ? null
          : String(this.n(raw, 'lastSeenDate', 'LastSeenDate'))
      });
    });

    connection.on('TypingChanged', (raw: any) => {
      this.typingChangedSubject.next({
        LetterRef: Number(this.n(raw, 'letterRef', 'LetterRef') ?? 0),
        CentralRef: Number(this.n(raw, 'centralRef', 'CentralRef') ?? 0),
        UserRef: Number(this.n(raw, 'userRef', 'UserRef') ?? 0),
        DisplayName: String(this.n(raw, 'displayName', 'DisplayName') ?? 'کاربر'),
        IsTyping: Boolean(this.n(raw, 'isTyping', 'IsTyping'))
      });
    });

    connection.on('TicketPresenceChanged', (raw: any) => {
      const usersRaw = this.n(raw, 'users', 'Users') ?? [];
      const users: OnlineTicketUser[] = (Array.isArray(usersRaw) ? usersRaw : []).map((u: any) => ({
        CentralRef: Number(this.n(u, 'centralRef', 'CentralRef') ?? 0),
        UserRef: Number(this.n(u, 'userRef', 'UserRef') ?? 0),
        DisplayName: String(this.n(u, 'displayName', 'DisplayName') ?? 'کاربر'),
        ConnectionCount: Number(this.n(u, 'connectionCount', 'ConnectionCount') ?? 1)
      }));

      this.presenceChangedSubject.next({
        LetterRef: Number(this.n(raw, 'letterRef', 'LetterRef') ?? 0),
        Users: users
      });
    });

    connection.on('TicketUnreadChanged', (raw: any) => {
      this.ticketUnreadChangedSubject.next({
        LetterRef: Number(this.n(raw, 'letterRef', 'LetterRef') ?? 0),
        ConversationCode: Number(this.n(raw, 'conversationCode', 'ConversationCode') ?? 0),
        SenderCentralRef: Number(this.n(raw, 'senderCentralRef', 'SenderCentralRef') ?? 0),
        SenderUserRef: this.n(raw, 'senderUserRef', 'SenderUserRef') == null
          ? null
          : Number(this.n(raw, 'senderUserRef', 'SenderUserRef'))
      });
    });

    connection.onreconnecting(() => {
      this.stateSubject.next(signalR.HubConnectionState.Reconnecting);
    });

    connection.onreconnected(async () => {
      this.stateSubject.next(signalR.HubConnectionState.Connected);
      await this.restoreRegistration();
    });

    connection.onclose(() => {
      this.stateSubject.next(signalR.HubConnectionState.Disconnected);

      if (this.signalRConfig.enabled !== false) {
        setTimeout(() => void this.ensureConnected(), 5000);
      }
    });

    return connection;
  }

  async openTicket(letterRef: number): Promise<void> {
    if (this.signalRConfig.enabled === false) {
      return;
    }

    const oldLetter = this.currentLetterRef;
    if (oldLetter && oldLetter !== letterRef) {
      try {
        await this.leaveTicket(oldLetter);
      } catch {
        // ignore
      }
    }

    this.currentLetterRef = letterRef;

    await this.ensureConnected();
    await this.registerClient();

    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinTicket', letterRef);
      await this.refreshPresence(letterRef);
    }
  }

  async leaveTicket(letterRef: number): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveTicket', letterRef);
      } catch {
        // connection may be closing
      }
    }

    if (this.currentLetterRef === letterRef) {
      this.currentLetterRef = undefined;
    }
  }

  async setTyping(letterRef: number, isTyping: boolean): Promise<void> {
    if (this.signalRConfig.enabled === false) return;
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return;

    try {
      await this.connection.invoke('Typing', letterRef, isTyping);
    } catch {
      // best effort
    }
  }

  async refreshPresence(letterRef: number): Promise<void> {
    if (this.signalRConfig.enabled === false) return;
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return;

    try {
      const usersRaw = await this.connection.invoke<any[]>('GetTicketPresence', letterRef);

      const users: OnlineTicketUser[] = (usersRaw ?? []).map((u: any) => ({
        CentralRef: Number(this.n(u, 'centralRef', 'CentralRef') ?? 0),
        UserRef: Number(this.n(u, 'userRef', 'UserRef') ?? 0),
        DisplayName: String(this.n(u, 'displayName', 'DisplayName') ?? 'کاربر'),
        ConnectionCount: Number(this.n(u, 'connectionCount', 'ConnectionCount') ?? 1)
      }));

      this.presenceChangedSubject.next({
        LetterRef: letterRef,
        Users: users
      });
    } catch (error) {
      console.warn('GetTicketPresence failed', error);
    }
  }

  private async ensureConnected(): Promise<void> {
    if (this.signalRConfig.enabled === false) {
      return;
    }

    if (!this.connection) {
      this.connection = this.buildConnection();
    }

    if (this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.starting) {
      await this.starting;
      return;
    }

    this.stateSubject.next(signalR.HubConnectionState.Connecting);

    this.starting = (async () => {
      try {
        await this.connection!.start();

        this.stateSubject.next(
          signalR.HubConnectionState.Connected
        );

        await this.restoreRegistration();
      } catch (error) {
        this.stateSubject.next(
          signalR.HubConnectionState.Disconnected
        );

        console.error(
          'SignalR start failed',
          error
        );

        throw error;
      } finally {
        this.starting = undefined;
      }
    })();

    await this.starting;
  }

  private async registerClient(): Promise<void> {
    if (this.connection?.state !== signalR.HubConnectionState.Connected) return;

    await this.connection.invoke('RegisterClient');
  }

  private async restoreRegistration(): Promise<void> {
    if (this.signalRConfig.enabled === false) {
      return;
    }

    await this.registerClient();

    if (
      this.currentLetterRef &&
      this.connection?.state === signalR.HubConnectionState.Connected
    ) {
      await this.connection.invoke(
        'JoinTicket',
        this.currentLetterRef
      );

      await this.refreshPresence(
        this.currentLetterRef
      );
    }
  }
}
