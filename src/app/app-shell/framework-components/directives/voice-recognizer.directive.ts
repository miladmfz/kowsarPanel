import { NgControl } from '@angular/forms';
import { Directive, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { VoiceRecognitionService } from '../../framework-services/voice-recognition.service';
declare var $: any;

@Directive({
    selector: '[appVoiceRecognizer]',
    providers: []
})
export class VoiceRecognizerDirective implements AfterViewInit {

    voiceRecognizer: any;
    isRecording = false;

    constructor(private el: ElementRef,
        private control: NgControl,
        private voiceRecognitionService: VoiceRecognitionService,
        private renderer: Renderer2) {
        this.voiceRecognitionService.init();
    }

    ngAfterViewInit(): void {
        this.voiceRecognizer = $(this.el.nativeElement);

        const parent = this.renderer.parentNode(this.el.nativeElement);

        // Create Button 
        const button = this.renderer.createElement("button");
        this.renderer.addClass(button, "btn");
        this.renderer.addClass(button, "record-btn");
        this.renderer.setAttribute(button, "type", "button");

        // Create icon
        const icon = this.renderer.createElement("i");
        this.renderer.addClass(icon, "fa");
        this.renderer.addClass(icon, "fa-microphone");
        this.renderer.addClass(icon, "fa-1-5x");
        this.renderer.setAttribute(icon, "area-hidden", "true");

        this.renderer.appendChild(button, icon);

        this.renderer.listen(button, "click", (event) => {
            if (this.isRecording) {
                this.stopService();
                this.renderer.removeClass(icon, "text-danger");
                this.isRecording = false;
            } else {
                this.startService(icon);
                this.renderer.addClass(icon, "text-danger");
                this.isRecording = true;
            }
        });

        this.renderer.appendChild(parent, button);
    }

    startService(icon) {
        this.voiceRecognitionService.start(this.control.control);
    }

    stopService() {
        this.voiceRecognitionService.stop();
        // this.control.control.setValue(this.voiceRecognitionService.text);
    }
}
