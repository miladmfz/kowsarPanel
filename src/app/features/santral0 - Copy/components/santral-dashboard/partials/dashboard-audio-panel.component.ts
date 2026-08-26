import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-audio-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (selectedRecordingUrl) {
      <div class="card kws-player-card">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <div>
              <h5 class="mb-1">پخش مکالمه</h5>
              <div class="text-muted small">{{ selectedRecordingTitle }}</div>
            </div>

            <button type="button" class="btn btn-sm btn-light" (click)="clearRecording.emit()">
              <i class="mdi mdi-close"></i>
              بستن
            </button>
          </div>

          <audio [src]="selectedRecordingUrl" controls class="w-100"></audio>
        </div>
      </div>
    }

    @if (audioModalVisible) {
      <div class="kws-audio-backdrop" (click)="closeAudioModal.emit()"></div>

      <div class="kws-audio-modal" dir="rtl">
        <div class="kws-audio-header">
          <div>
            <h5>پخش ضبط تماس</h5>
            <p>{{ audioTitle }}</p>
          </div>

          <button type="button" class="btn btn-light" (click)="closeAudioModal.emit()">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        <div class="kws-audio-body">
          <audio controls autoplay [src]="audioUrl"></audio>
        </div>
      </div>
    }
  `
})
export class DashboardAudioPanelComponent {
  @Input() selectedRecordingUrl = '';
  @Input() selectedRecordingTitle = '';
  @Input() audioModalVisible = false;
  @Input() audioUrl = '';
  @Input() audioTitle = '';

  @Output() clearRecording = new EventEmitter<void>();
  @Output() closeAudioModal = new EventEmitter<void>();
}
