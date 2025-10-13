import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CentralWebApiService } from '../../../services/CentralWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
  selector: 'app-central-edit',
  templateUrl: './central-edit.component.html',
})
export class CentralEditComponent implements OnInit {

  constructor(
    private repo: CentralWebApiService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,

  ) { }

  Code: string = '';
  GoodTypeStr: string = '';
  Imageitem: string = '';
  items: any[] = [];

  imageData: string = ''; // Variable to hold the image data


  EditForm_Central = new FormGroup({
    CentralCode: new FormControl(0),
    Title: new FormControl(''),
    Name: new FormControl(''),
    FName: new FormControl(''),
    Manager: new FormControl(''),
    Delegacy: new FormControl(''),
    CentralName: new FormControl(''),
  });


  ngOnInit(): void {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;
        this.getDetails();
      }
    });



  }


  onFileSelected(event: any): void {

    const file = event.target.files[0];
    if (file) {

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer(this.Code, imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }



  sendImageToServer(ObjectCode: string, imageData: string): void {

    const data = {
      ClassName: "Central",
      ObjectCode: ObjectCode,
      image: imageData
    };

    this.repo.SendImageToServer(data).subscribe((response) => {
      this.fetchImageData();
    });

  }


  fetchImageData() {

    this.repo.GetImageFromServer(this.Code).subscribe((data: any) => {

      this.Imageitem = `data:${Image};base64,${data.Text}`;
      this.loadingService.hide()
    });
  }




  getDetails() {
    this.loadingService.show()
    this.repo.GetCentralById(this.Code).subscribe((data: any) => {

      this.EditForm_Central.patchValue({
        CentralCode: data.Centrals[0].CentralCode,
        Title: data.Centrals[0].Title,
        Name: data.Centrals[0].Name,
        FName: data.Centrals[0].FName,
        Manager: data.Centrals[0].Manager,
        Delegacy: data.Centrals[0].Delegacy,
        CentralName: data.Centrals[0].CentralName,
      });
      this.fetchImageData()
    });



  }



  onBtnCancelClick() {
    this.router.navigateByUrl('support/central-list');
  }



}
