import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import * as RecordRTC from 'recordrtc';
declare var $: any;

@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.component.html'
})
export class VoiceRecorderComponent implements OnInit {

  @Input() set audioSource(value) {
    this.loadAudio(value);
  }
  source: any;

  @ViewChild('audioPlayer') audioPlayerRef: ElementRef;

  @Output() recordEnded = new EventEmitter<any>();

  isRecording = false;
  recorder: any;
  url: any;
  error: any;
  stream: any;

  constructor(private domSanitizer: DomSanitizer, private renderer: Renderer2) { }

  ngOnInit(): void {

  }

  loadAudio(value) {
    if (value) {
      this.source = this.domSanitizer.bypassSecurityTrustUrl("data:audio/wav;base64," + value + " ");
    } else {
      this.source = '';
    }
    if (this.audioPlayerRef) {
      this.audioPlayerRef.nativeElement.load();
    }
  }

  initiateRecording() {
    const icon = $('#record-icon')
    if (this.isRecording) {
      this.isRecording = false;
      icon.removeClass("text-danger");
      this.stopRecording();
    } else {
      this.isRecording = true;
      icon.addClass("text-danger");
      this.url = null;
      let mediaConstraints = {
        video: false,
        audio: true
      };
      navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then(this.successCallback.bind(this),
          this.errorCallback.bind(this));
    }
  }

  successCallback(stream: any) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      sampleRate: 44100,
      bufferSize: 4096
    };

    // this.recorder = new RecordRTC.StereoAudioRecorder(stream, options);
    this.recorder.record();
    this.stream = stream;
  }

  stopRecording() {
    this.recorder.stop(this.processRecording.bind(this));
    this.stream.getAudioTracks()[0].stop();
    this.recorder.clearRecordedData();
  }

  processRecording(blob: any) {
    this.url = URL.createObjectURL(blob);
    this.recordEnded.emit(blob);
    const audio = this.audioPlayerRef.nativeElement;
    const src = $("#audioSource");
    this.renderer.setAttribute(audio.children[0], "src", this.url);
    audio.load();
  }

  errorCallback(_error: any) {
    this.error = 'Can not play audio in your browser';
  }
}
