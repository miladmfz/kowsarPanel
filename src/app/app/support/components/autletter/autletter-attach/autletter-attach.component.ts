import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';

@Component({
  selector: 'app-autletter-attach',
  templateUrl: './autletter-attach.component.html',
})
export class AutletterAttachComponent implements OnInit {

  constructor(
    private repo: AutletterWebApiService,
    private router: Router,
    private http: HttpClient,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private sharedService: SharedService,

  ) { }
  @Input() TextData: string = '';

  EditForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl('AutLetter'),
    Type: new FormControl('Zip'),
    FilePath: new FormControl(''),
    FileType: new FormControl(''),
    Data: new FormControl(''),
  });

  attachfiles_array: any[] = [];

  ngOnInit() {
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
    this.EditForm.patchValue({
      ObjectRef: this.TextData,

    });

    const command = this.EditForm.value;
    if (action == 'delete') {

    }
    this.repo.AttachFile_Insert(command).subscribe((data) => {
      this.EditForm.reset();
      this.sharedService.triggerActionAll('refresh');

    });

  }

  GetAttachFileList() {

    this.EditForm.patchValue({
      Title: "",
      FileName: "",
      ObjectRef: this.TextData,
      ClassName: "AutLetter",
      Type: "Zip",
      FilePath: "",
      FileType: "",
      Data: "",
    });


    this.repo.GetAttachFileList(this.EditForm.value).subscribe((data: any) => {

      this.attachfiles_array = data.AttachedFiles
    });
  }


  DownloadAttach(index: any) {

    this.repo.downloadFile(this.attachfiles_array[index].AttachedFileCode, "AutLetter", this.TextData).subscribe(blob => {
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








