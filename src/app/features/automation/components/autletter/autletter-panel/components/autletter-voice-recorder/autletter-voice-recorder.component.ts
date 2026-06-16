import { Component, ElementRef, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-autletter-voice-recorder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <button (click)="startRecording()" [disabled]="isRecording">ضبط</button>
      <button (click)="stopRecording()" [disabled]="!isRecording">توقف</button>
      <button (click)="confirmVoice()" [disabled]="!recordReady">ارسال ویس</button>
      <button (click)="cancelVoice()" [disabled]="!isRecording && !recordReady">لغو</button>

      <audio #audioPlayer *ngIf="audioPreviewUrl" controls>
        <source [src]="audioPreviewUrl" type="audio/wav" />
      </audio>

      <div *ngIf="voiceToText">
        <small>متن تشخیص داده شده:</small>
        <p>{{ voiceToText() }}</p>
      </div>
    </div>
  `
})
export class AutletterVoiceRecorderComponent {

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;

  @Output() voiceReady = new EventEmitter<{
    base64: string;
    transcript: string;
  }>();

  // Audio recording
  mediaRecorder!: MediaRecorder;
  isRecording = false;
  isProcessing = false;
  recordReady = false;
  recordSeconds = 0;
  recordTimer: any;
  audioChunks: BlobPart[] = [];
  audioPreviewUrl: string | null = null;
  voiceToText = signal('')
  audioFile: File | null = null;

  private readonly client = inject(HttpClient);

  constructor() { }

  private resetRecording() {
    this.audioPreviewUrl = null;
    this.voiceToText = signal('')
    this.recordReady = false;
    this.audioChunks = [];
    this.recordSeconds = 0;
    this.isProcessing = false;
    this.audioFile = null;
  }

  startRecording() {
    if (this.isRecording) return;

    this.audioPreviewUrl = null;
    this.voiceToText = signal('')
    this.recordReady = false;
    this.recordSeconds = 0;
    this.audioChunks = [];
    this.isRecording = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordTimer = setInterval(() => this.recordSeconds++, 1000);

      this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
      this.mediaRecorder.start();
    });
  }

  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    clearInterval(this.recordTimer);

    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

      if (audioBlob.size < 500) {
        this.recordReady = false;
        console.warn('فایل صوتی خیلی کوتاه است.');
        return;
      }

      this.audioFile = new File([audioBlob], 'voice.wav', { type: 'audio/wav' });
      this.audioPreviewUrl = URL.createObjectURL(this.audioFile);

      try {
        const formData = new FormData();
        formData.append('file', this.audioFile);

        const response = await this.client
          .post<{ text: string }>('http://localhost:60006/api/automation/UploadAndTranscribe', formData)
          .toPromise();

        this.voiceToText.set(response?.text || '')
        this.recordReady = true;
      } catch (err) {
        console.error('خطا در تبدیل ویس به متن:', err);
        this.recordReady = false;
      }
    };
  }

  confirmVoice() {
    if (!this.audioPreviewUrl) return;

    this.isProcessing = true;

    fetch(this.audioPreviewUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Voice = (reader.result as string).split(',')[1];

          this.voiceReady.emit({
            base64: base64Voice,
            transcript: this.voiceToText()
          });

          this.resetRecording();
          this.isProcessing = false;
        };
        reader.readAsDataURL(blob);
      });
  }

  cancelVoice() {
    this.resetRecording();
  }
}
