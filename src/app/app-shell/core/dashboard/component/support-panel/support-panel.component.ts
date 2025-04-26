import { Component, OnInit, Renderer2 } from '@angular/core';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { CellWithoutRowsSupportPanel } from './cell-withoutrows-label-support-panel';
import { CellOpenFactorSupportPanel } from './cell-openfactor-label-support-panel copy';

@Component({
  selector: 'app-support-panel',
  templateUrl: './support-panel.component.html',
})
export class SupportPanelComponent
  extends AgGridBaseComponent
  implements OnInit {



  records
  loading_supportpanel: boolean = true;
  BrokerRef: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval: any;



  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,

  ) {
    super();
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'BrokerNameWithoutType',
        headerName: 'گارشناس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'تعداد فاکتور بدون رکورد',
        filter: 'agSetColumnFilter',
        cellRenderer: CellWithoutRowsSupportPanel,
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'تعداد فاکتور باز',
        filter: 'agSetColumnFilter',
        cellRenderer: CellOpenFactorSupportPanel,
        cellClass: 'text-center',
        minWidth: 70
      },

      {
        field: 'Factors',
        headerName: 'تعداد کل فاکتورها',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'RowsCount',
        headerName: 'تعداد ردیف‌ها',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'TotalWork',
        headerName: 'مجموع کارکرد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];




    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")
    }

    this.getpanel_data()

    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }


  refreshpage() {
    this.getpanel_data()
  }

  getpanel_data() {

    this.repo.GetSupportPanel().subscribe((data: any) => {
      this.loading_supportpanel = false
      if (this.BrokerRef == '') {
        // this.reportData = data.Panels;
        this.records = data.Panels;
      } else {
        // this.reportData = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);
        this.records = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);
      }

    });



  }







}
