import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import * as RecordRTC from 'recordrtc';
declare var $: any;

@Component({
  selector: 'app-voice-player',
  templateUrl: './voice-player.component.html'
})
export class VoicePlayerComponent implements OnInit {

  @Input() set audioSource(value) {
    this.loadAudio(value);
  }
  source: any;

  @ViewChild('audioPlayer') audioPlayerRef: ElementRef;

  constructor(private domSanitizer: DomSanitizer) { }

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
}
