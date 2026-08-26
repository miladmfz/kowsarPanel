import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AttendanceCallReportComponent } from '../call-report/attendance-call-report.component';

@Component({
  selector: 'app-attendance-call-report-modal',
  standalone: true,
  imports: [CommonModule, AttendanceCallReportComponent],
  templateUrl: './attendance-call-report-modal.component.html',
  styleUrls: ['./attendance-call-report-modal.component.css'],
})
export class AttendanceCallReportModalComponent {
  @Input() visible = false;
  @Input() extension = '';
  @Input() personName = '';
  @Input() darkMode = false;

  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
