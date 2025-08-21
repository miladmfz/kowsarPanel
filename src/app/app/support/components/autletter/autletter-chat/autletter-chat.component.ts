import { Component, Input, OnInit, ElementRef, Renderer2, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { catchError, of } from 'rxjs';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';

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
    private readonly notificationService: NotificationService,

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
  data_resive_FileName: string | null = null;



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
    PixelScale: new FormControl(''),
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
    ConversationRef: new FormControl(''),
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
      PixelScale: "1000",
      ClassName: "Aut",
      ObjectRef: this.LetterRef,
      ConversationRef: this.chats[index].ConversationCode,
    });

    this.repo.GetConversationFileFromAttach(this.EditForm_Attach.value)
      .pipe(
        catchError(error => {
          this.Loading_Modal_Response_close();
          this.notificationService.error('این فاکتور دارای اقلام می باشد', "خطا");
          return of(null); // یا هر مقدار جایگزین
        })
      ).subscribe((data: any) => {
        this.Loading_Modal_Response_close();
        console.error(data);
        this.downloadFile(data);

      }, error => {
        this.Loading_Modal_Response_close();
        console.error("❌ خطا در گرفتن فایل:", error);
      });
  }


  downloadFile(data: { text: string; contentType: string; fileName: string }) {
    if (!data || !data.text || !data.contentType || !data.fileName) {
      console.error('Data invalid for download');
      return;
    }

    try {
      // Decode base64
      const byteCharacters = atob(data.text);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create blob
      const blob = new Blob([byteArray], { type: data.contentType });

      // Create download link
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link); // لازم نیست اما مطمئن تره
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (e) {
      console.error('Download failed', e);
    }
  }










  sendMessage() {
    if (!this.newMessage || this.newMessage.trim().length === 0) {
      return; // 👈 خالی بود برگرد
    }

    this.repo.Conversation_Insert(this.LetterRef, this.CentralRef, this.newMessage.trim())
      .subscribe(() => {
        this.newMessage = '';
        this.GetAutConversation();
      });
  }



  getFileCategory(contentType: string, fileName?: string): string {
    // بررسی contentType
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType.startsWith('audio/')) return 'Voice';
    if (contentType.startsWith('video/')) return 'Video';
    if (contentType === 'application/pdf') return 'PDF';
    if (contentType === 'application/json') return 'JSON';
    if (contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      contentType === 'application/msword') return 'Word';
    if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      contentType === 'application/vnd.ms-excel') return 'Excel';
    if (contentType === 'application/zip' || contentType === 'application/x-rar-compressed' ||
      contentType === 'application/x-7z-compressed') return 'Compressed';

    // اگر contentType مشخص نبود، پسوند فایل رو بررسی کن
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      switch (ext) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          return 'Image';
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'm4a':
          return 'Voice';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'mkv':
          return 'Video';
        case 'pdf':
          return 'PDF';
        case 'json':
          return 'JSON';
        case 'doc':
        case 'docx':
          return 'Word';
        case 'xls':
        case 'xlsx':
          return 'Excel';
        case 'zip':
        case 'rar':
        case '7z':
          return 'Compressed';
        default:
          return 'Other';
      }
    }

    return 'Other';
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


        const fileNameParts = file.name.replace(' ', '').split('.');
        this.selectedFileName = fileNameParts[0];
        console.log(this.selectedFileType)

        if (this.selectedFileType == 'x-zip-compressed' || this.selectedFileType == 'x-compressed') {
          this.selectedFileType = "rar"
        }

        if (this.selectedFileType.length < 1 || this.selectedFileType.length > 10) {
          alert('فایل ناشناخته است، به حالت فشرده تبدیل کنید.');
          return;

        }



        const fileSizeKB = Math.round(file.size / 1024); // Convert to KB
        const maxSizeKB = 20 * 1024; // 20 MB in KB

        if (fileSizeKB > maxSizeKB) {
          alert("حجم فایل نباید بیشتر از 20MB باشد!");
          return; // جلوگیری از ادامه آپلود
        }


        const fileCategory = this.getFileCategory(file.type);
        this.EditForm.patchValue({
          Title: fileCategory,
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
            this.resetRecording()
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
