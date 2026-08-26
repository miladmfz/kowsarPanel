import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class WebPhoneAudioService {

    private audio: HTMLAudioElement | null = null;
    private boundSessions = new WeakSet<any>();
    private boundPeerConnections = new WeakSet<RTCPeerConnection>();
    private lastTrackId = '';

    attachSession(session: any): void {
        if (!session || typeof document === 'undefined') {
            return;
        }

        this.ensureAudioElement();

        if (this.boundSessions.has(session)) {
            if (session.connection) {
                this.attachPeerConnection(session.connection);
            }

            return;
        }

        this.boundSessions.add(session);

        session.on('peerconnection', (event: any) => {
            const pc =
                event?.peerconnection ??
                event?.peerConnection ??
                session.connection;

            if (pc) {
                this.attachPeerConnection(pc);
            }
        });

        session.on('accepted', () => {
            if (session.connection) {
                this.attachPeerConnection(session.connection);
            }
        });

        session.on('confirmed', () => {
            if (session.connection) {
                this.attachPeerConnection(session.connection);
            }
        });

        if (session.connection) {
            this.attachPeerConnection(session.connection);
        }

        setTimeout(() => {
            if (session.connection) {
                this.attachPeerConnection(session.connection);
            }
        }, 500);

        setTimeout(() => {
            if (session.connection) {
                this.attachPeerConnection(session.connection);
            }
        }, 1500);
    }

    stop(): void {
        if (!this.audio) {
            return;
        }

        this.audio.pause();
        this.audio.srcObject = null;
        this.lastTrackId = '';
    }

    private ensureAudioElement(): HTMLAudioElement {
        if (this.audio) {
            return this.audio;
        }

        const audio = document.createElement('audio');

        audio.autoplay = true;
        audio.muted = false;
        audio.volume = 1;
        audio.style.display = 'none';

        audio.setAttribute('playsinline', 'true');

        document.body.appendChild(audio);

        this.audio = audio;

        return audio;
    }

    private attachPeerConnection(pc: RTCPeerConnection): void {
        if (this.boundPeerConnections.has(pc)) {
            this.attachAudioFromReceivers(pc);
            return;
        }

        this.boundPeerConnections.add(pc);

        pc.addEventListener('track', (event: RTCTrackEvent) => {
            const stream = event.streams?.[0];

            if (stream) {
                this.setRemoteStream(stream);
                return;
            }

            if (event.track && event.track.kind === 'audio') {
                this.setRemoteStream(new MediaStream([event.track]));
            }
        });

        this.attachAudioFromReceivers(pc);

        setTimeout(() => this.attachAudioFromReceivers(pc), 500);
        setTimeout(() => this.attachAudioFromReceivers(pc), 1500);
    }

    private attachAudioFromReceivers(pc: RTCPeerConnection): void {
        const receivers = pc.getReceivers ? pc.getReceivers() : [];

        const tracks = receivers
            .map(receiver => receiver.track)
            .filter((track): track is MediaStreamTrack =>
                !!track &&
                track.kind === 'audio' &&
                track.readyState === 'live'
            );

        if (tracks.length === 0) {
            return;
        }

        this.setRemoteStream(new MediaStream(tracks));
    }

    private setRemoteStream(stream: MediaStream): void {
        const audio = this.ensureAudioElement();

        const tracks = stream
            .getAudioTracks()
            .filter(track => track.readyState === 'live');

        if (tracks.length === 0) {
            return;
        }

        const trackId = tracks.map(track => track.id).join('|');

        if (this.lastTrackId === trackId && audio.srcObject) {
            return;
        }

        this.lastTrackId = trackId;

        audio.srcObject = new MediaStream(tracks);
        audio.muted = false;
        audio.volume = 1;

        audio.play().catch(() => {
            // Browser may block autoplay until user interaction.
        });
    }
}