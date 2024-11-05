import { Component, OnInit } from '@angular/core';
import { DownloadWebApiService } from '../../services/DownloadWebApi.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';

@Component({
  selector: 'app-download-edit',
  templateUrl: './download-edit.component.html',
})
export class DownloadEditComponent implements OnInit {

  constructor(private repo: DownloadWebApiService, private router: Router) { }

  EditForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl(''),
    Type: new FormControl(''),
    FilePath: new FormControl(''),
    FileType: new FormControl(''),
    Data: new FormControl(''),
  });


  ClassName_Lookup: Base_Lookup[] = [
    { id: "Web_download", name: "فایل" },
    { id: "Web_url", name: "اینترنتی" },
  ]

  Type_Lookup: Base_Lookup[] = [
    { id: "Zip", name: "فایل فشرده" },
    { id: "URL", name: "ادرس مجازی (link)" },
  ]



  ToDayDate: string = "";
  ClassName: string = "";
  Type: string = "";
  newMessage: string = '';
  selectedImage: string | ArrayBuffer | null = null;
  selectedFileName: string = '';
  selectedFileSize: number = 0;
  selectedFileType: string = '';



  CentralRef: string = '';



  ngOnInit() {

    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer

    });

  }

  onchangeClassName() {

    this.ClassName = this.EditForm.value.ClassName

    if (this.EditForm.value.ClassName == "Web_url") {
      this.EditForm.patchValue({
        Type: "URL",
      });
    } else {
      this.EditForm.patchValue({
        Type: "",
      });

    }

  }

  onchangeType() {
    this.Type = this.EditForm.value.Type
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


    this.CentralRef = sessionStorage.getItem("CentralRef");
    const command = this.EditForm.value;
    if (action == 'delete') {

      // TODO List

    }


    this.repo.SetAttachFile(command).subscribe((data) => {
      this.router.navigate(['/document/download-list']);
    });



    //this.EditForm.reset()


  }





}
