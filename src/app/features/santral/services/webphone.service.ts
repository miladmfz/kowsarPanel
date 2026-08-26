import { Injectable, signal } from '@angular/core';
import * as JsSIP from 'jssip';
import { PhoneCustomerContext, WebPhoneLine } from '../models/webphone.models';

export type WebPhoneRegisterStatus =
    | 'offline'
    | 'connecting'
    | 'registered'
    | 'failed';

export type WebPhoneCallStatus =
    | 'idle'
    | 'calling'
    | 'ringing'
    | 'incoming'
    | 'active'
    | 'held'
    | 'ended'
    | 'failed';

export interface WebPhoneConfig {
    wsUrl: string;
    domain: string;
    extension: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class WebPhoneService {

    registerStatus = signal<WebPhoneRegisterStatus>('offline');
    callStatus = signal<WebPhoneCallStatus>('idle');

    registerMessage = signal('');
    resultMessage = signal('');

    extension = signal('');
    isReady = signal(false);

    lines = signal<WebPhoneLine[]>([
        this.createEmptyLine(1),
        this.createEmptyLine(2),
        this.createEmptyLine(3)
    ]);

    activeLineIndex = signal(1);

    // اطلاعات مخاطب تماس در سرویس سراسری نگهداری می‌شود تا با تغییر Route از بین نرود.
    customerContext = signal<PhoneCustomerContext | null>(null);
    customerContextLoading = signal(false);

    private ua: any = null;
    private config: WebPhoneConfig | null = null;
    private started = false;

    private incomingSessionHandler: ((session: any) => void) | null = null;

    init(config: WebPhoneConfig): void {
        if (!config.wsUrl || !config.domain || !config.extension || !config.password) {
            this.registerStatus.set('failed');
            this.registerMessage.set('WebPhone config is incomplete');
            return;
        }

        if (this.started && this.config) {
            const sameConfig =
                this.config.wsUrl === config.wsUrl &&
                this.config.domain === config.domain &&
                this.config.extension === config.extension &&
                this.config.password === config.password;

            if (sameConfig) {
                return;
            }

            if (this.ua) {
                this.registerMessage.set('WebPhone is already connected');
                return;
            }
        }

        this.config = config;

        this.extension.set(config.extension);
        this.started = true;
        this.isReady.set(true);

        this.registerMessage.set('WebPhone service initialized');
    }

    isStarted(): boolean {
        return this.started;
    }

    getUa(): any {
        return this.ua;
    }

    isConnected(): boolean {
        return !!this.ua;
    }

    setIncomingSessionHandler(handler: (session: any) => void): void {
        this.incomingSessionHandler = handler;
    }

    clearIncomingSessionHandler(): void {
        this.incomingSessionHandler = null;
    }

    connect(): void {
        if (!this.config) {
            this.registerStatus.set('failed');
            this.registerMessage.set('WebPhone config is missing');
            return;
        }

        if (this.ua) {
            return;
        }

        try {
            this.registerStatus.set('connecting');
            this.registerMessage.set('Connecting...');

            const socket = new JsSIP.WebSocketInterface(this.config.wsUrl);

            this.ua = new JsSIP.UA({
                sockets: [socket],
                uri: `sip:${this.config.extension}@${this.config.domain}`,
                authorization_user: this.config.extension,
                password: this.config.password,
                display_name: `WebPhone ${this.config.extension}`,
                register: true,
                register_expires: 300,
                session_timers: false
            });

            this.bindUaEvents();

            this.ua.start();

        } catch {
            this.ua = null;
            this.registerStatus.set('failed');
            this.registerMessage.set('WebPhone connect failed');
        }
    }

    disconnect(): void {
        this.lines().forEach(line => {
            if (!line.session) {
                return;
            }

            try {
                line.session.terminate();
            } catch {
                // ignore
            }
        });

        try {
            if (this.ua) {
                this.ua.stop();
            }
        } catch {
            // ignore
        }

        this.ua = null;

        this.clearLines();
        this.customerContext.set(null);
        this.customerContextLoading.set(false);

        this.registerStatus.set('offline');
        this.callStatus.set('idle');
        this.registerMessage.set('WebPhone disconnected');
    }

    createEmptyLine(index: number): WebPhoneLine {
        return {
            index,
            label: `Line ${index}`,
            session: null,
            status: 'empty',
            number: '',
            name: '',
            direction: 'none',
            muted: false,
            held: false,
            answered: false,
            startedAt: null,
            connectedAt: null
        };
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

    updateLine(index: number, patch: Partial<WebPhoneLine>): void {
        this.lines.update(lines =>
            lines.map(line =>
                line.index === index
                    ? { ...line, ...patch }
                    : line
            )
        );
    }

    clearLine(index: number): void {
        this.updateLine(index, this.createEmptyLine(index));
    }

    clearLines(): void {
        this.lines.set([
            this.createEmptyLine(1),
            this.createEmptyLine(2),
            this.createEmptyLine(3)
        ]);

        this.activeLineIndex.set(1);
    }

    private bindUaEvents(): void {
        if (!this.ua) {
            return;
        }

        this.ua.on('connecting', () => {
            this.registerStatus.set('connecting');
            this.registerMessage.set('Connecting...');
        });

        this.ua.on('connected', () => {
            this.registerMessage.set('Socket connected');
        });

        this.ua.on('registered', () => {
            this.registerStatus.set('registered');
            this.registerMessage.set('Registered');
        });

        this.ua.on('unregistered', () => {
            this.registerStatus.set('offline');
            this.registerMessage.set('Unregistered');
        });

        this.ua.on('disconnected', () => {
            this.ua = null;
            this.registerStatus.set('offline');
            this.registerMessage.set('Disconnected');
        });

        this.ua.on('registrationFailed', () => {
            this.ua = null;
            this.registerStatus.set('failed');
            this.registerMessage.set('Registration failed');
        });

        this.ua.on('newRTCSession', (event: any) => {
            const session = event?.session;

            if (!session) {
                return;
            }

            if (event.originator !== 'remote') {
                return;
            }

            if (this.incomingSessionHandler) {
                this.incomingSessionHandler(session);
            }
        });
    }
}
