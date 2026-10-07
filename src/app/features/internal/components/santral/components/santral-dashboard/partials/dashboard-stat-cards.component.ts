import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { secondsToFaText } from '../../../shared/utils/santral-format.util';

@Component({
  selector: 'app-dashboard-stat-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row g-3 mb-3">
      <div class="col-xl-3 col-md-6">
        <div class="card kws-stat-card kws-stat-primary">
          <div class="card-body">
            <div class="kws-stat-icon"><i class="mdi mdi-phone-log-outline"></i></div>
            <div>
              <div class="kws-stat-title">کل تماس‌ها</div>
              @if (loading) {
                <span class="kws-skeleton-value wide"></span>
              } @else {
                <div class="kws-stat-value">{{ totalCalls | number }}</div>
              }
              <div class="kws-stat-sub">در بازه انتخابی</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-stat-card kws-stat-success">
          <div class="card-body">
            <div class="kws-stat-icon"><i class="mdi mdi-phone-check-outline"></i></div>
            <div>
              <div class="kws-stat-title">تماس پاسخ داده شده</div>
              @if (loading) {
                <span class="kws-skeleton-value wide"></span>
              } @else {
                <div class="kws-stat-value">{{ answeredCalls | number }}</div>
              }
              @if (loading) {
                <span class="kws-skeleton-line small"></span>
              } @else {
                <div class="kws-stat-sub">نرخ پاسخگویی: {{ answerRate }}٪</div>
              }
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-stat-card kws-stat-warning">
          <div class="card-body">
            <div class="kws-stat-icon"><i class="mdi mdi-phone-missed-outline"></i></div>
            <div>
              <div class="kws-stat-title">تماس بی‌پاسخ</div>
              @if (loading) {
                <span class="kws-skeleton-value wide"></span>
              } @else {
                <div class="kws-stat-value">{{ noAnswerCalls | number }}</div>
              }
              <div class="kws-stat-sub">نیازمند پیگیری</div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-stat-card kws-stat-gold">
          <div class="card-body">
            <div class="kws-stat-icon"><i class="mdi mdi-phone-cancel-outline"></i></div>
            <div>
              <span class="kws-stat-title">تماس اشغال</span>
              @if (loading) {
                <span class="kws-skeleton-value wide"></span>
              } @else {
                <div class="kws-stat-value">{{ busyCalls | number }}</div>
              }
              <div class="kws-stat-sub">نیازمند پیگیری</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-xl-3 col-md-6">
        <div class="card kws-mini-card">
          <div class="card-body">
            <div>
              <div class="kws-mini-label">مکالمه ضبط‌شده</div>
              @if (loading) {
                <span class="kws-skeleton-value mini"></span>
              } @else {
                <strong>{{ recordedCalls | number }}</strong>
              }
            </div>
            <i class="mdi mdi-record-rec"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-mini-card">
          <div class="card-body">
            <div>
              <span class="kws-mini-label">تماس ناموفق</span>
              @if (loading) {
                <span class="kws-skeleton-value mini"></span>
              } @else {
                <strong>{{ failedCalls | number }}</strong>
              }
            </div>
            <i class="mdi mdi-alert-circle-outline"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-mini-card">
          <div class="card-body">
            <div>
              <span class="kws-mini-label">مجموع زمان مکالمه</span>
              @if (loading) {
                <span class="kws-skeleton-value mini"></span>
              } @else {
                <strong>{{ formatSeconds(summary?.total_billsec) }}</strong>
              }
            </div>
            <i class="mdi mdi-timer-outline"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card kws-mini-card">
          <div class="card-body">
            <div>
              <span class="kws-mini-label">میانگین مکالمه</span>
              @if (loading) {
                <span class="kws-skeleton-value mini"></span>
              } @else {
                <strong>{{ formatSeconds(summary?.avg_billsec) }}</strong>
              }
            </div>
            <i class="mdi mdi-chart-timeline-variant"></i>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardStatCardsComponent {
  @Input() summary: any = {};
  @Input() totalCalls = 0;
  @Input() answeredCalls = 0;
  @Input() noAnswerCalls = 0;
  @Input() busyCalls = 0;
  @Input() failedCalls = 0;
  @Input() recordedCalls = 0;
  @Input() answerRate = 0;
  @Input() loading = false;

  formatSeconds(value: any): string {
    return secondsToFaText(value);
  }
}
