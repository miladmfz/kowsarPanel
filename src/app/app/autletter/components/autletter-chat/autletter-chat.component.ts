import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-autletter-chat',
  templateUrl: './autletter-chat.component.html',

})
export class AutletterChatComponent implements OnInit {

  constructor(
    private repo: AutletterWebApiService,
    private router: Router,
    private http: HttpClient

  ) { }
  @Input() TextData: string = '';


  chats: any[] = [];
  users: any[] = [];
  selectedOption: string = '0';
  dateValue = new FormControl();
  items: any[] = [];
  searchTerm: string = '';
  CentralRef: string = '';
  descriptionFormControl = new FormControl();

  selectedUserId: number = 0;
  newMessage: string = '';





  ngOnInit() {
    this.CentralRef = "4";

    console.log("textdata-chat=" + this.TextData)


    this.GetAutConversation();




  }

  GetAutConversation() {
    this.chats = [];
    this.repo.GetAutConversation(this.TextData).subscribe(e => {
      this.chats = e;
      console.log(e)
    });

  }



  sendMessage() {
    if (this.newMessage.trim() !== '') {

      this.repo.Conversation_Insert(this.TextData, this.CentralRef, this.newMessage).subscribe(e => {

        this.newMessage = '';
        this.GetAutConversation();

      });



    }


  }


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageData = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.sendImageToServer("0", imageData); // Replace '12345' with your barcode value
      };
      reader.readAsDataURL(file);
    }
  }




  sendImageToServer(ObjectCode: string, imageData: string): void {
    console.log("sendImageToServer")

    const data = {
      ClassName: "Aut",
      ObjectCode: ObjectCode,
      image: imageData,
      LetterRef: this.TextData,
      CentralRef: this.CentralRef,

    };

    this.http.post<any>(environment.baseUrl + 'Conversation_UploadImage', data).subscribe(
      (response) => {

        console.log(response)
        this.GetAutConversation();
      },
      (error) => {
        console.error('Error uploading image:', error);
      }
    );
  }

  Imageitem: string = '';

  GetImage(index: any): void {
    const url = environment.baseUrl + 'GetWebImagess?pixelScale=1000&ClassName=Aut&ObjectRef=' + this.chats[index].ConversationCode;

    this.http.get<any>(url).subscribe(
      (data: any) => {

        this.Imageitem = `data:${Image};base64,${data.Text}`;

      },
      (error) => {
        console.error('Error occurred while fetching image data:', error);
      }
    );


  }



  fetchImageData() {

  }







}








