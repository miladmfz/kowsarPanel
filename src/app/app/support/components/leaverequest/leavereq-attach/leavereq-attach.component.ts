import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LeaveRequestWebApiService } from '../../../services/LeaveRequestWebApi.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CellActionLeaveReqAttach } from './cell-action-leavereq-attach';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
  selector: 'app-leavereq-attach',
  templateUrl: './leavereq-attach.component.html',
})
export class LeavereqAttachComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private repo: LeaveRequestWebApiService,
    private loadingService: LoadingService,
    private router: Router,
    private http: HttpClient,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private sharedService: SharedService,
    private themeService: ThemeService
  ) {
    super();
  }


  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  records
  loading_attach: boolean = true;
  @Input() TextData: string = '';

  EditForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl('LeaveReq'),
    Type: new FormControl('Zip'),
    FilePath: new FormControl(''),
    FileType: new FormControl(''),
    Data: new FormControl(''),
  });

  attachfiles_array: any[] = [];

  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionLeaveReqAttach,
        cellRendererParams: {
          editUrl: '/support/leavereq-edit',
        },
        width: 200,
      }, {
        field: 'Title',
        headerName: 'Title',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'FileName',
        headerName: 'FileName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'CreationDate',
        headerName: 'CreationDate',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      }
    ];

    this.GetAttachFileList();
    //this.CentralRef = sessionStorage.getItem("CentralRef");
    this.CallService()
  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {
    this.GetAttachFileList();
  }


  DownloadFile(Data: any) {

    this.repo.downloadFile(Data.AttachedFileCode, "LeaveReq", this.TextData).subscribe(blob => {
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




  newMessage: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFileName: string = '';
  selectedFileSize: number = 0;
  selectedFileType: string = '';

  isFileSizeExceeded(): boolean {
    return this.selectedFileSize > 10240; // 10 MB in KB
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.selectedImage = e.target.result; // Get the base64 image data
        this.selectedFileName = file.name.replace(' ', '').split('.')[0];
        this.selectedFileSize = Math.round(file.size / 1024); // Convert size to KB and round it
        this.selectedFileType = file.type.split('/')[1]

        this.EditForm.patchValue({
          FileName: this.selectedFileName,
          FileType: this.selectedFileType,
          Data: imageData,
        });

        //this.sendImageToServer("0", imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }

  submit(action) {
    this.loadingService.show()
    this.EditForm.patchValue({
      ObjectRef: this.TextData,

    });

    const command = this.EditForm.value;
    if (action == 'delete') {

    }
    this.repo.AttachFile_Insert(command).subscribe((data) => {
      this.loadingService.hide()
      this.EditForm.reset();
      this.sharedService.triggerActionAll('refresh');
      this.selectedImage = null

    });

  }

  GetAttachFileList() {

    this.loading_attach = true
    this.EditForm.patchValue({
      Title: "",
      FileName: "",
      ObjectRef: this.TextData,
      ClassName: "LeaveReq",
      Type: "Zip",
      FilePath: "",
      FileType: "",
      Data: "",
    });


    this.repo.GetAttachFileList(this.EditForm.value).subscribe((data: any) => {

      this.records = data.AttachedFiles
      this.loading_attach = false
    });
  }







}



