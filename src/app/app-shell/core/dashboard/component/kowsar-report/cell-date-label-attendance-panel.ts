import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import moment from "jalali-moment";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    <span >
    {{ formatToJalali(MinCreationDate) }}
    </span>
`,
    standalone: false
})
export class CellDateMinDate implements ICellRendererAngularComp {
    params: any;
    state: null
    MinCreationDate: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.MinCreationDate != null) {

                this.MinCreationDate = params.data.MinCreationDate;
            }
        }
    }



    formatToJalali(date: string | null | undefined): string {
        if (!date || date === '0001-01-01T00:00:00') {
            return '—'; // یا هر متنی که دوست داری نشون بده برای حالت‌های خالی
        }

        const m = moment(date);
        if (!m.isValid()) {
            return 'نامعتبر';
        }

        return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
    }

}