import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

/**
 * =========================================================
 * CellStateAutletter
 * ---------------------------------------------------------
 * نمایش وضعیت نامه داخل AG Grid
 * - ارجاع
 * - دیده شده
 * - جدید
 * =========================================================
 */

@Component({
  selector: 'validation-state-cell-renderer',
  standalone: true,

  template: `

    <div class="kws-state-wrapper">

      @switch (state) {

        @case ('True') {

        <span class="kws-state-badge kws-state-warning">

          <span class="kws-state-dot"></span>

          <span>
            ارجاع
          </span>

        </span>

        }

        @case ('False') {

        <span class="kws-state-badge kws-state-primary">

          <span>
            دیده شده
          </span>

        </span>

        }

        @default {

        <span class="kws-state-badge kws-state-danger">

          <span class="kws-state-dot"></span>

          <span>
            جدید
          </span>

        </span>

        }

      }

    </div>

  `,

  styles: [`

    /* =====================================================
       Wrapper
    ===================================================== */

    .kws-state-wrapper {

      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      height: 100%;

    }

    /* =====================================================
       Badge
    ===================================================== */

    .kws-state-badge {

      display: inline-flex;
      align-items: center;
      gap: 8px;

      padding: 6px 12px;

      border-radius: 999px;

      font-size: 12px;
      font-weight: 700;

      line-height: 1;

      transition: all .18s ease;

      border: 1px solid transparent;

      white-space: nowrap;

    }

    .kws-state-badge:hover {

      transform: translateY(-1px);

    }

    /* =====================================================
       Dot
    ===================================================== */

    .kws-state-dot {

      width: 7px;
      height: 7px;

      border-radius: 50%;

      flex-shrink: 0;

      animation: kwsPulse 1.8s infinite;

    }

    /* =====================================================
       Warning
    ===================================================== */

    .kws-state-warning {

      background: rgba(255, 193, 7, .12);

      color: #d39e00;

      border-color: rgba(255, 193, 7, .18);

    }

    .kws-state-warning .kws-state-dot {

      background: #ffc107;

    }

    /* =====================================================
       Primary
    ===================================================== */

    .kws-state-primary {

      background: rgba(13, 110, 253, .10);

      color: #0d6efd;

      border-color: rgba(13, 110, 253, .16);

    }

    .kws-state-primary .kws-state-dot {

      background: #0d6efd;

    }

    /* =====================================================
       Danger
    ===================================================== */

    .kws-state-danger {

      background: rgba(220, 53, 69, .10);

      color: #dc3545;

      border-color: rgba(220, 53, 69, .16);

    }

    .kws-state-danger .kws-state-dot {

      background: #dc3545;

    }

    /* =====================================================
       Animation
    ===================================================== */

    @keyframes kwsPulse {

      0%, 100% {

        opacity: 1;

      }

      50% {

        opacity: .35;

      }

    }

    /* =====================================================
       Dark Mode
    ===================================================== */

    :host-context([data-bs-theme="dark"]) {

      .kws-state-warning {

        background: rgba(255, 193, 7, .16);

        color: #ffd54f;

      }

      .kws-state-primary {

        background: rgba(59, 130, 246, .18);

        color: #93c5fd;

      }

      .kws-state-danger {

        background: rgba(239, 68, 68, .16);

        color: #fca5a5;

      }

    }

  `]
})
export class CellStateAutletterKowsar implements ICellRendererAngularComp {

  /**
   * AG Grid Params
   */
  params: any;

  /**
   * وضعیت جاری
   */
  state: string = '';

  /**
   * مقداردهی اولیه
   */
  agInit(params: any): void {

    this.params = params;

    this.state = params?.data?.AlarmActive ?? '';

  }

  /**
   * جلوگیری از refresh اضافی
   */
  refresh(): boolean {

    return false;

  }

}
