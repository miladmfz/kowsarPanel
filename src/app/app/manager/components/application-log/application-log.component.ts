import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-log',
  templateUrl: './application-log.component.html',
})
export class ApplicationLogComponent extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست  لاگ های سیستم';

  constructor(
    private readonly router: Router,
    private repo: ManagerWebApiService,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs = [

      {
        field: 'WebLogCode',
        headerName: 'WebLogCode',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'ClassName',
        headerName: 'ClassName ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CreationDate',
        headerName: 'CreationDate',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'LogValue',
        headerName: 'LogValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'TagName',
        headerName: 'TagName  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
    ];

    this.getList();
  }
  getList() {

    this.repo.GetWebLog().subscribe((data) => {
      this.records = data;

    });

  }




}

