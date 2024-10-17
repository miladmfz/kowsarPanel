import { Component, Input, OnInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-autletter-chat',
  templateUrl: './autletter-chat.component.html',

})

export class AutletterChatComponent implements OnInit {

  constructor(
    private repo: AutletterWebApiService,
    private router: Router,
    private http: HttpClient,
    private elementRef: ElementRef,
    private renderer: Renderer2,

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
    this.CentralRef = sessionStorage.getItem("CentralRef");
    this.GetAutConversation();
  }

  GetAutConversation() {
    this.chats = [];
    this.repo.GetAutConversation(this.TextData).subscribe(e => {
      this.chats = e;
      setTimeout(() => {
        this.scrollToListItem();
      }, 200);
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

    const data = {
      ClassName: "Aut",
      ObjectCode: ObjectCode,
      image: imageData,
      LetterRef: this.TextData,
      CentralRef: this.CentralRef,

    };

    this.repo.SendImageToServer(data).subscribe((response) => {
      this.GetAutConversation();
    });

  }




  Imageitem: string = '';

  GetImage(index: any): void {

    this.repo.GetImageFromServer(this.chats[index].ConversationCode).subscribe((data: any) => {

      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });
  }







  basketsum!: string
  isDesktop: boolean = true;
  loading: boolean = true;

  menuId!: string;
  mizname: string = '';



  @ViewChild('listsContainer') listsContainer!: ElementRef;
  @ViewChild('groupList') groupList!: ElementRef;
  @ViewChild('itemList') itemList!: ElementRef;
  @ViewChild('basketList') basketList!: ElementRef;
  @ViewChild('itemListRef', { static: false }) itemListRef!: ElementRef;
  @ViewChild('itemElement', { static: false }) itemElement!: ElementRef[];



  scrollToListItem(): void {
    const secondItem = this.elementRef.nativeElement.querySelector('.item-sdsd:nth-last-child(-n+2)');
    const lastItem = this.elementRef.nativeElement.querySelector('.item-sdsd:last-child');

    if (lastItem) {
      lastItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  onListScroll(event: any) {
    const listElement = event.target;


    const listItemElements1 = listElement.querySelectorAll('li');

    listItemElements1.forEach((itemElement: any) => {
      const titleElement = itemElement.querySelector('.card-Goodcode');

      const rect = itemElement.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      const titleText = titleElement.textContent.trim();


    });






    const listItemElements = listElement.querySelectorAll('li');

    listItemElements.forEach((itemElement: any) => {
      const titleElement = itemElement.querySelector('.card-grp');

      const rect = itemElement.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      // console.log('*********************************');
      // console.log('rect:', rect.top);
      // console.log('rect.bottom:', rect.bottom);
      // console.log('window.innerHeight:', window.innerHeight);
      // console.log('isVisible:', isVisible);
      if (isVisible && titleElement) {

      }
    });

  }

  addScrollingToElement(element: HTMLElement, headerHeight: number): void {
    this.renderer.setStyle(element, 'overflow-y', 'auto');
    this.renderer.setStyle(element, 'max-height', `calc(100vh - ${headerHeight}px)`);

  }
  ngAfterViewInit(): void {

    const headerContainer = this.listsContainer.nativeElement.previousElementSibling;
    const headerHeight = headerContainer.offsetHeight;
    this.renderer.setStyle(headerContainer, 'position', 'sticky');
    this.renderer.setStyle(headerContainer, 'top', '0');

    this.addScrollingToElement(this.groupList.nativeElement, headerHeight);
    this.addScrollingToElement(this.itemList.nativeElement, headerHeight);

    if (this.basketList) {
      this.addScrollingToElement(this.basketList.nativeElement, headerHeight);
    }





  }

}








