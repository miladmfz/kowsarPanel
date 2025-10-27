import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { DownloadWebApiService } from '../../services/DownloadWebApi.service';
import { FormControl } from '@angular/forms';
import { CellActionDownload } from './cell-action-download';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-download-list',
    templateUrl: './download-list.component.html',
    standalone: false
})
export class DownloadListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: DownloadWebApiService,
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


  records;
  title = 'لیست نرم افزار های کاربردی ';
  dateValue = new FormControl();
  PersonInfoCode: string = '';
  Searchtarget: string = '';
  JobPersonRef: string = '';
  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();


    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });





    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionDownload,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      // {
      //   field: 'وضعیت تیکت',
      //   cellRenderer: ValidateionStateCellAutletterWorkRenderer,
      //   cellClass: 'text-center',


      //   minWidth: 80

      // },
      {
        field: 'Title',
        headerName: 'عنوان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ClassName',
        headerName: 'دسته بندی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'FileName',
        headerName: 'نام فایل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'Type',
        headerName: 'نوع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 80
      },



      {
        field: 'FilePath',
        headerName: 'آدرس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ReformDate',
        headerName: 'تاریخ ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }
  getList() {

    this.repo.KowsarAttachFile(this.Searchtarget)
      .subscribe((data) => {

        this.records = data;

      });



  }

  navigateToEdit(id) {
    this.router.navigate(['/document/download-edit', id]);
  }





  btnToDownload(AttachedFileCode): void {

    this.repo.downloadFile(AttachedFileCode, "Web_download", "0")
      .subscribe(blob => {
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = 'KowsarDownload.zip';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }, error => {
        console.error('Error downloading file: ', error);
      });
  }


}



