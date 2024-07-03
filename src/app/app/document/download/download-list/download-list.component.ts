import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { DownloadWebApiService } from '../../services/DownloadWebApi.service';
import { FormControl } from '@angular/forms';
import { CellActionDownload } from './cell-action-download';

@Component({
  selector: 'app-download-list',
  templateUrl: './download-list.component.html',
})
export class DownloadListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: DownloadWebApiService,
  ) {
    super();
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

    this.repo.KowsarAttachFile(this.Searchtarget).subscribe((data) => {

      this.records = data;

    });



  }

  navigateToEdit(id) {
    this.router.navigate(['/document/download-edit', id]);
  }





  btnToDownload(code): void {
    /*
        this.repo.downloadFile(code).subscribe(response => {
          const contentDispositionHeader = response.headers.get('Content-Disposition');
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDispositionHeader);
          let fileName = 'download.zip'; // Default file name
    
          if (matches != null && matches[1]) {
            fileName = matches[1].replace(/['"]/g, '');
          }
    
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(response.body);
          downloadLink.setAttribute('download', fileName);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }, error => {
          console.error('Error downloading file: ', error);
        });
    
    */



    this.repo.downloadFile(code).subscribe(blob => {
      console.log(blob)
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = 'KowsarDownload.zip'; // Set desired file name here
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }, error => {
      console.error('Error downloading file: ', error);
    });
  }


}



