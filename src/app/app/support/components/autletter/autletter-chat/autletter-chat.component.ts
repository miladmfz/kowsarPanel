import { Component, Input, OnInit, ElementRef, Renderer2, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-chat',
  templateUrl: './autletter-chat.component.html',
})
export class AutletterChatComponent implements OnInit, AfterViewInit, AfterViewChecked {

  constructor(
    private repo: AutletterWebApiService,
    private http: HttpClient,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  // Audio recording
  mediaRecorder!: MediaRecorder;
  isRecording = false;
  isProcessing = false;
  recordReady = false;
  recordSeconds = 0;
  recordTimer: any;
  audioChunks: BlobPart[] = [];
  audioPreviewUrl: string | null = null;
  voiceToText: string = '';
  audioFile: File | null = null;
  selectedVoiceUrl: string = '';


  data_resive_FileUrl: string | null = null;
  data_resive_FileType: string | null = null;




  // Chat data
  chats: any[] = [];
  Imageitem: string = '';
  newMessage: string = '';

  // File upload
  selectedImage: string | ArrayBuffer | null = null;
  selectedFileName: string = '';
  selectedFileSize: number = 0;
  selectedFileType: string = '';

  // Session & settings
  @Input() LetterRef: string = '';
  CentralRef: string = '';
  ToDayDate: string = '';
  ClassName: string = '';
  Type: string = '';

  EditForm_Attach = new FormGroup({
    Title: new FormControl(''),
    pixelScale: new FormControl(''),
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
  });


  EditForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl(''),
    Type: new FormControl(''),
    FilePath: new FormControl(''),
    FileType: new FormControl(''),
    File: new FormControl(''),
    LetterRef: new FormControl(''),
    CentralRef: new FormControl(''),
  });


  allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'application/json', 'application/xml', 'text/csv',
    'application/zip', 'application/x-rar-compressed', 'application/gzip', 'application/x-7z-compressed',
    'text/html', 'text/css', 'application/javascript'
  ];

  descriptionFormControl = new FormControl();
  dateValue = new FormControl();

  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('listsContainer') listsContainer!: ElementRef;
  @ViewChild('groupList') groupList!: ElementRef;
  @ViewChild('itemList') itemList!: ElementRef;
  @ViewChild('basketList') basketList!: ElementRef;

  private resetRecording() {
    this.audioPreviewUrl = null;
    this.voiceToText = '';
    this.recordReady = false;
    this.audioChunks = [];
    this.recordSeconds = 0;
    this.isProcessing = false;
    this.audioFile = null;
  }


  ngOnInit() {
    this.CentralRef = sessionStorage.getItem("CentralRef") || '';
    this.GetAutConversation();
  }



  GetAutConversation() {
    this.Loading_Modal_Response_show()
    this.repo.GetAutConversation(this.LetterRef).subscribe(chats => {
      this.Loading_Modal_Response_close()
      this.chats = chats;
      setTimeout(() => this.scrollToListItem(), 200);
    });
  }

  GetImageFileFromAttach(index: any): void {

    this.Loading_Modal_Response_show()
    this.repo.GetImageFileFromAttach(this.chats[index].ConversationCode).subscribe((data: any) => {
      this.Loading_Modal_Response_close()
      this.Imageitem = `data:${Image};base64,${data.Text}`;



    });

  }


  GetVoiceFileFromAttach(index: any): void {

    this.Loading_Modal_Response_show()
    this.repo.GetVoiceFileFromAttach(this.chats[index].ConversationCode).subscribe((data: any) => {
      this.Loading_Modal_Response_close()
      this.voiceModal_show()

      this.selectedVoiceUrl = `data:${data.ContentType};base64,${data.Text}`;

    });

  }


  GetFileFromAttach(index: number): void {

    this.Loading_Modal_Response_show();





    this.EditForm_Attach.patchValue({
      Title: this.chats[index].ConversationText,
      pixelScale: "1000",
      ClassName: "Aut",
      ObjectRef: this.chats[index].ConversationCode,
    });


    this.repo.GetConversationFileFromAttach(this.EditForm_Attach.value).subscribe((data: any) => {
      this.Loading_Modal_Response_close();

      this.data_resive_FileUrl = `data:${data.ContentType};base64,${data.Text}`;
      this.data_resive_FileType = data.ContentType;

      if (this.selectedFileType.startsWith('image/')) {
        this.openModal('#imageModal');
      } else if (this.selectedFileType.startsWith('audio/')) {
        this.openModal('#voiceModal');
      } else if (this.selectedFileType === 'application/pdf') {
        this.openModal('#pdfModal');
      } else {
        this.openModal('#fileModal'); // فایل‌های متفرقه
      }
    });
  }





  GetFileFromAttach1(index: any): void {
    this.Loading_Modal_Response_show();





    this.EditForm_Attach.patchValue({
      Title: this.chats[index].ConversationText,
      pixelScale: "1000",
      ClassName: "Aut",
      ObjectRef: this.chats[index].ConversationCode,
    });




    this.repo.GetConversationFileFromAttach(this.EditForm_Attach.value).subscribe((data: any) => {
      this.Loading_Modal_Response_close();

      if (!data || !data.Text || !data.ContentType) return;

      this.data_resive_FileUrl = `data:${data.ContentType};base64,${data.Text}`;
      this.data_resive_FileType = data.ContentType;

      // تصمیم‌گیری بر اساس نوع فایل
      if (data.ContentType.startsWith('image/')) {
        this.imagemodal_show();
      } else if (data.ContentType.startsWith('audio/')) {
        this.voiceModal_close();
      } else if (data.ContentType.startsWith('video/')) {
        this.videomodal_show();
      } else if (data.ContentType === 'application/pdf') {
        this.Pdfmodal_show();
      } else {
        this.showDownloadLinkModal(this.chats[index].ConversationCode);
      }
    });
  }


  showDownloadLinkModal(AttachedFileCode): void {

    this.repo.downloadFile(AttachedFileCode, "Web_download", "0").subscribe(blob => {
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






  sendMessage() {
    if (this.newMessage.trim()) {
      this.repo.Conversation_Insert(this.LetterRef, this.CentralRef, this.newMessage)
        .subscribe(() => {
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
        const filedata = e.target.result.split(',')[1]; // Get base64 data (remove the header)
        this.selectedImage = e.target.result; // Get the base64 image data
        this.selectedFileName = file.name.replace(' ', '').split('.')[0];
        this.selectedFileSize = Math.round(file.size / 1024); // Convert size to KB and round it
        this.selectedFileType = file.type.split('/')[1]

        if (!file.type.startsWith("image/")) {
          alert("فقط فایل تصویری (jpg, png, gif, ...) مجاز است.");
          return;
        }


        this.EditForm.patchValue({
          Title: "Image",
          FileName: this.selectedFileName,
          ObjectRef: "0",
          ClassName: "Aut",
          Type: "",
          FilePath: "",
          FileType: this.selectedFileType,
          File: filedata,
          LetterRef: this.LetterRef,
          CentralRef: this.CentralRef,
        });

        this.Loading_Modal_Response_show()
        this.repo.Conversation_UploadFile(this.EditForm.value).subscribe(() => {
          this.Loading_Modal_Response_close()
          this.GetAutConversation()
        }
        );
      };
      reader.readAsDataURL(file);
    }
  }


  startRecording() {
    if (this.isRecording) return;

    this.audioPreviewUrl = null;
    this.voiceToText = '';
    this.recordReady = false;
    this.recordSeconds = 0;
    this.audioChunks = [];
    this.isRecording = true;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordTimer = setInterval(() => this.recordSeconds++, 1000);

      this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
      this.mediaRecorder.start();
    });
  }

  stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    clearInterval(this.recordTimer);

    this.mediaRecorder.stop();
    this.mediaRecorder.onstop = async () => {
      // ساخت blob از قطعات صوتی
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

      // بررسی حجم منطقی فایل
      if (audioBlob.size < 500) {
        this.recordReady = false;
        console.warn('فایل صوتی خیلی کوتاه است.');
        return;
      }

      // ساخت File از Blob
      this.audioFile = new File([audioBlob], 'voice.wav', { type: 'audio/wav' });

      // ساخت URL برای پیش‌نمایش
      this.audioPreviewUrl = URL.createObjectURL(this.audioFile);

      // فرستادن فایل به backend و گرفتن متن
      try {
        const formData = new FormData();
        formData.append('file', this.audioFile);

        // فرض: endpoint backend تو /api/transcribe هست
        const response = await this.http.post<{ text: string }>('http://localhost:60006/api/Support/UploadAndTranscribe', formData).toPromise();
        this.voiceToText = response?.text || '';
        this.recordReady = true;
      } catch (err) {
        console.error('خطا در تبدیل ویس به متن:', err);
        this.recordReady = false;
      }
    };
  }


  confirmVoice() {
    if (!this.audioPreviewUrl) return;

    this.isProcessing = true;

    fetch(this.audioPreviewUrl)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Voice = (reader.result as string).split(',')[1];

          // تنظیم مقادیر فرم مشابه آپلود عکس
          this.EditForm.patchValue({
            Title: "Voice",
            FileName: `voice_${new Date().getTime()}`,
            ObjectRef: "0",
            ClassName: "Aut",
            Type: "",
            FilePath: "",
            FileType: "mp3",   // یا wav بستگی به Recorder داره
            File: base64Voice,
            LetterRef: this.LetterRef,
            CentralRef: this.CentralRef,
          });

          // ارسال به سرور
          this.Loading_Modal_Response_show();
          this.repo.Conversation_UploadFile(this.EditForm.value).subscribe(() => {
            this.Loading_Modal_Response_close();
            this.GetAutConversation();
          });
        };
        reader.readAsDataURL(blob);
      });
  }
















  cancelVoice() {
    this.resetRecording();
  }

  playAudio() { this.audioPlayer?.nativeElement.play(); }
  pauseAudio() { this.audioPlayer?.nativeElement.pause(); }


  scrollToListItem() {
    const lastItem = this.elementRef.nativeElement.querySelector('.item-sdsd:last-child');
    if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  addScrollingToElement(element: HTMLElement, headerHeight: number) {
    this.renderer.setStyle(element, 'overflow-y', 'auto');
    this.renderer.setStyle(element, 'max-height', `calc(100vh - ${headerHeight}px)`);
  }

  ngAfterViewChecked() {
    if (this.audioPreviewUrl && this.audioPlayer) this.audioPlayer.nativeElement.load();
  }

  ngAfterViewInit(): void {
    const headerContainer = this.listsContainer.nativeElement.previousElementSibling;
    const headerHeight = headerContainer?.offsetHeight || 0;
    if (headerContainer) {
      this.renderer.setStyle(headerContainer, 'position', 'sticky');
      this.renderer.setStyle(headerContainer, 'top', '0');
    }

    this.addScrollingToElement(this.groupList.nativeElement, headerHeight);
    this.addScrollingToElement(this.itemList.nativeElement, headerHeight);
    if (this.basketList) this.addScrollingToElement(this.basketList.nativeElement, headerHeight);
  }







  voiceModal_show() {
    const modal = this.renderer.selectRootElement('#voiceModal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  voiceModal_close() {
    const modal = this.renderer.selectRootElement('#voiceModal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  imagemodal_show() {
    const modal = this.renderer.selectRootElement('#imagemodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  imagemodal_close() {
    const modal = this.renderer.selectRootElement('#imagemodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  videomodal_show() {
    const modal = this.renderer.selectRootElement('#videomodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  videomodal_close() {
    const modal = this.renderer.selectRootElement('#videomodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  Pdfmodal_show() {
    const modal = this.renderer.selectRootElement('#Pdfmodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Pdfmodal_close() {
    const modal = this.renderer.selectRootElement('#Pdfmodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }






  Loading_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Loading_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#loadingresponse', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  openModal(modalId: string) {
    const modal = this.renderer.selectRootElement(modalId, true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  closeModal(modalId: string) {
    const modal = this.renderer.selectRootElement(modalId, true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}
