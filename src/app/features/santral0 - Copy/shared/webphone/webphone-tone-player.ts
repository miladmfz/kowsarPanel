export interface WebPhoneToneOptions {
  frequencies: number[];
  gain: number;
  toneDurationMs: number;
  intervalMs: number;
}

export class WebPhoneTonePlayer {
  private timer: any = null;
  private context: AudioContext | null = null;
  private startToken: symbol | null = null;

  constructor(private readonly options: WebPhoneToneOptions) { }

  start(): void {
    if (this.timer || this.startToken) {
      return;
    }

    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    if (!this.context) {
      this.context = new AudioContextClass();
    }

    const token = Symbol('webphone-tone');
    this.startToken = token;

    const startLoop = () => {
      if (this.startToken !== token || this.timer) {
        return;
      }

      this.startToken = null;
      this.playTone();

      this.timer = setInterval(() => {
        this.playTone();
      }, this.options.intervalMs);
    };

    if (this.context.state === 'suspended') {
      this.context.resume().then(startLoop).catch(startLoop);
      return;
    }

    startLoop();
  }

  stop(): void {
    this.startToken = null;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  dispose(): void {
    this.stop();

    if (this.context) {
      this.context.close().catch(() => { });
      this.context = null;
    }
  }

  private playTone(): void {
    if (!this.context || this.context.state === 'closed') {
      return;
    }

    const gain = this.context.createGain();
    const oscillators = this.options.frequencies.map(frequency => {
      const oscillator = this.context!.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      return oscillator;
    });

    gain.gain.value = this.options.gain;
    gain.connect(this.context.destination);

    oscillators.forEach(oscillator => oscillator.start());

    setTimeout(() => {
      try {
        oscillators.forEach(oscillator => oscillator.stop());
        gain.disconnect();
      } catch { }
    }, this.options.toneDurationMs);
  }
}
