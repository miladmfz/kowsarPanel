import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiAuditEvent } from '../../../services/BiWebApi/bi.models';

@Component({
  selector: 'app-bi-audit', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <main class="audit" dir="rtl">
      <header><div><span>Governed activity</span><h1>ممیزی داشبوردهای BI</h1><p>رویدادهای مشاهده، تغییر تعریف، انتشار، Rollback و Share بدون ذخیره داده ردیفی یا فیلتر حساس.</p></div><a routerLink="/accounting/gozareshat/bi">بازگشت به BI Home</a></header>
      @if (error()) { <div class="error">{{ error() }}</div> }
      <section><table><thead><tr><th>زمان</th><th>رویداد</th><th>داشبورد</th><th>Actor</th><th>Target</th><th>جزئیات امن</th></tr></thead><tbody>
        @for (event of events(); track event.auditCode) { <tr><td>{{ event.createdAt | date:'yyyy/MM/dd HH:mm:ss' }}</td><td><strong>{{ event.eventType }}</strong></td><td>{{ event.dashboardTitle || event.dashboardCode || '—' }}</td><td>{{ event.actorSubject }}</td><td>{{ event.targetType ? event.targetType + ': ' + event.targetKey : '—' }}</td><td><code>{{ event.details | json }}</code></td></tr> }
        @empty { <tr><td colspan="6">رویدادی ثبت نشده است.</td></tr> }
      </tbody></table></section>
    </main>`,
  styles: [`:host{display:block}.audit{min-height:100%;padding:1.4rem;background:#f5f7fb;color:#17233c}header{display:flex;justify-content:space-between;gap:1rem;padding:1.4rem;border-radius:18px;color:#fff;background:linear-gradient(125deg,#14213d,#245edb)}header span{font-size:.72rem;color:#a8d7ff}h1{margin:.2rem 0}header p{margin:0;color:#dbeafe}header a{align-self:start;color:#fff;border:1px solid #ffffff55;border-radius:9px;padding:.6rem;text-decoration:none}section{margin-top:1rem;overflow:auto;border:1px solid #dfe5ef;border-radius:14px;background:#fff}table{width:100%;border-collapse:collapse;white-space:nowrap}th,td{padding:.75rem;border-bottom:1px solid #e5e7eb;text-align:right;font-size:.78rem}th{background:#f8fafc}code{white-space:normal}.error{margin-top:1rem;padding:.8rem;color:#8d2119;background:#fff4f3}:host-context(html[data-bs-theme='dark']) .audit,:host-context(body[data-layout-color='dark']) .audit,:host-context(body[data-layout-mode='dark']) .audit{background:#101827;color:#e5edf9}:host-context(html[data-bs-theme='dark']) section,:host-context(body[data-layout-color='dark']) section,:host-context(body[data-layout-mode='dark']) section{border-color:#334155;background:#172033}:host-context(html[data-bs-theme='dark']) th,:host-context(body[data-layout-color='dark']) th,:host-context(body[data-layout-mode='dark']) th{background:#202c40}:host-context(html[data-bs-theme='dark']) th,:host-context(html[data-bs-theme='dark']) td,:host-context(body[data-layout-color='dark']) th,:host-context(body[data-layout-color='dark']) td,:host-context(body[data-layout-mode='dark']) th,:host-context(body[data-layout-mode='dark']) td{border-bottom-color:#334155}:host-context(html[data-bs-theme='dark']) .error,:host-context(body[data-layout-color='dark']) .error,:host-context(body[data-layout-mode='dark']) .error{color:#fecaca;background:#451a1a}`],
})
export class BiAuditComponent {
  private readonly api = inject(BiWebApiService);
  protected readonly events = signal<BiAuditEvent[]>([]);
  protected readonly error = signal('');
  constructor() { this.api.getAudit(200).subscribe({ next: items => this.events.set(items), error: error => this.error.set(error?.error?.error ?? error?.error?.Error ?? 'بارگذاری Audit انجام نشد.') }); }
}
