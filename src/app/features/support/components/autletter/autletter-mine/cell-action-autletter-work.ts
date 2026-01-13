import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { Router } from '@angular/router';

@Component({
    selector: 'cell-action-autletter-work',
    standalone: true,
    template: `
    <div class="d-flex align-items-center justify-content-center gap-2">
      <!--   ویرایش -->
            <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        (click)="onEdit()"
        title="ویرایش"
      >
        <i class="fas fa-edit"></i>
      </button>
  `,
})
export class CellActionAutletterWork implements ICellRendererAngularComp {
    /** داده‌های ورودی از AG Grid */
    params: any;

    /** مجوزهای عملکرد */
    canEdit = true;
    canDelete = true;
    canView = true;

    /** شناسه رکورد */
    id: number = 0;

    constructor(private router: Router) { }

    // مقداردهی اولیه
    agInit(params: any): void {
        this.params = params;

        this.canEdit = params?.canEdit ?? true;
        this.canDelete = params?.canDelete ?? true;
        this.canView = params?.canView ?? true;
        this.id = params?.data?.LetterCode ?? 0;
    }

    // نیازی به رندر مجدد ندارد
    refresh(): boolean {
        return false;
    }

    /**   ویرایش */
    onEdit(): void {
        this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data);
    }

}
