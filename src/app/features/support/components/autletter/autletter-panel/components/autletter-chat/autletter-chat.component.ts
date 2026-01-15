import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

import { AutletterWebApiService } from 'src/app/features/support/services/AutletterWebApi.service';
import { AutletterFileUploadComponent } from '../autletter-file-upload/autletter-file-upload.component';
import { catchError, of } from 'rxjs';
declare var bootstrap: any;   //   اینجا باید باشد


@Component({
  selector: 'app-autletter-chat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AutletterFileUploadComponent,
    // AutletterVoiceRecorderComponent
  ],
  templateUrl: './autletter-chat.component.html'
})
export class AutletterChatComponent implements OnInit, AfterViewInit {

  @Input() ObjectRef = '';

  data_resive_FileUrl: string | null = null;   //   اضافه شود
  data_resive_FileName: string | null = null;  //   اضافه شود

  msgs: any[] = [];
  loading = false;
  modalLoading = false;
  LetterRef = '';
  CentralRef = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  MessageForm = new FormGroup({
    Description: new FormControl(''),
    LetterRef: new FormControl(''),
    CentralRef: new FormControl('')
  });
  EditForm_Attach = new FormGroup({
    Title: new FormControl(''),
    PixelScale: new FormControl(''),
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
    ConversationRef: new FormControl(''),
  });


  FileForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ClassName: new FormControl('Aut'),
    FileType: new FormControl(''),
    FilePath: new FormControl(''),
    File: new FormControl(''),
    Type: new FormControl(''),
    LetterRef: new FormControl(''),
    CentralRef: new FormControl('')
  });

  private readonly repo = inject(AutletterWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly cdr = inject(ChangeDetectorRef);


  constructor() { }

  ngOnInit(): void {
    this.LetterRef = this.ObjectRef;
    this.CentralRef = sessionStorage.getItem('CentralRef') ?? '';

    this.MessageForm.patchValue({
      LetterRef: this.LetterRef,
      CentralRef: this.CentralRef
    });

    this.FileForm.patchValue({
      LetterRef: this.LetterRef,
      CentralRef: this.CentralRef
    });

    this.GetAutConversation();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // ============================================================
  // دریافت لیست پیام‌ها
  // ============================================================
  GetAutConversation() {
    this.loadingService.show();
    this.repo.GetAutConversation(this.LetterRef).subscribe({
      next: (res: any) => {
        this.loadingService.hide();

        // اگر API جدید شبیه نسخه جدید فعلی‌ات باشد
        const list = res.Conversations ?? res;

        this.msgs = list.map((m: any) => ({
          Id: m.ConversationCode,
          ConversationText: m.ConversationText,
          CreationDate: m.CreationDate,
          Name: m.Name,
          ContentType: m.ContentType ?? '',
          FileName: m.FileName ?? '',
          FileType: m.FileType ?? '',
          ClassName: (m.ClassName ?? '').trim(),
          IsMine: m.CentralRef === this.CentralRef,
          ConversationCode: m.ConversationCode
        }));

        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.loadingService.hide();
        this.notificationService.error('خطا در دریافت پیام‌ها');
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { }
  }

  // ============================================================
  // ارسال پیام متنی
  // ============================================================
  onEnterPress(e: Event) {
    const event = e as KeyboardEvent;
    event.preventDefault();

    const desc = this.MessageForm.get('Description')?.value?.trim();
    if (!desc) return;

    this.SendMessage();
  }

  SendMessage() {
    const desc = this.MessageForm.get('Description')?.value?.trim();
    if (!desc) {
      this.notificationService.warning('متن پیام نباید خالی باشد');
      return;
    }

    const cleanMessage = this.convertToEnglishDigits(desc);
    this.loadingService.show();

    this.repo.Conversation_Insert(this.LetterRef, this.CentralRef, cleanMessage)
      .subscribe({
        next: () => {
          this.MessageForm.get('Description')?.setValue('');
          this.GetAutConversation();
          this.loadingService.hide();
        },
        error: () => {
          this.loadingService.hide();
          this.notificationService.error('ارسال پیام با خطا مواجه شد');
        }
      });
  }

  convertToEnglishDigits(str: string): string {
    const persian = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabic = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];

    for (let i = 0; i < 10; i++) {
      str = str.replace(persian[i], String(i)).replace(arabic[i], String(i));
    }
    return str;
  }

  // ============================================================
  // هندل کردن آپلود فایل از کامپوننت فرزند
  // ============================================================

  onFileReadyForUpload(payload: {
    Title: string;
    FileName: string;
    ObjectRef: string;
    ClassName: string;
    Type: string;
    FilePath: string;
    FileType: string;
    File: string;
  }) {

    this.FileForm.patchValue({
      Title: payload.Title,
      FileName: payload.FileName,
      ObjectRef: payload.ObjectRef,
      ClassName: payload.ClassName,
      Type: payload.Type,
      FilePath: payload.FilePath,
      FileType: payload.FileType,
      File: payload.File,
      LetterRef: this.LetterRef,
      CentralRef: this.CentralRef
    });

    this.UploadFile();
  }

  UploadFile() {
    this.loadingService.show();

    this.repo.Conversation_UploadFile(this.FileForm.value).subscribe({
      next: () => {
        this.loadingService.hide();
        this.GetAutConversation();
      },
      error: () => {
        this.loadingService.hide();
        this.notificationService.error('خطا در ارسال فایل');
      }
    });
  }

  GetFileFromAttach(index: number, type: string): void {

    this.resetModalState();
    this.loadingService.show();

    this.EditForm_Attach.patchValue({
      Title: this.msgs[index].ConversationText,
      PixelScale: "1000",
      ClassName: "Aut",
      ObjectRef: this.LetterRef,
      ConversationRef: this.msgs[index].ConversationCode,
    });

    this.repo.GetConversationFileFromAttach(this.EditForm_Attach.value)
      .pipe(
        catchError(error => {
          this.loadingService.hide();
          this.modalLoading = true;
          this.notificationService.error("مشکل در اتصال به سرور", "خطا");
          return of(null);
        })
      )
      .subscribe((data: any) => {

        if (!data) return;
        this.loadingService.hide();

        const blob = this.base64ToBlob(data.text, data.contentType);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName || 'file';
        a.click();

        URL.revokeObjectURL(url);
/*
        this.data_resive_FileUrl = url;
        this.data_resive_FileName = data.fileName;
        this.modalLoading = true;

        // 👇 مهم: ابتدا modal باز شود
        setTimeout(() => {

          switch (type) {
            case 'voice': this.openModal('voiceModal'); break;
            case 'image': this.openModal('imageModal'); break;
            case 'pdf': this.openModal('pdfModal'); break;
            case 'video': this.openModal('videoModal'); break;
            default: this.openModal('fileModal'); break;
          }

          // 👇 و بعد Angular تغییرات را اعمال کند
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 10);

          this.loadingService.hide();

        }, 50)
        */;
      });
  }

  resetModalState() {

    // پاک‌کردن داده‌ها
    this.data_resive_FileUrl = null;
    this.data_resive_FileName = null;
    this.modalLoading = true;

    // پاک‌سازی کامل DOM مودال‌ها (جلوگیری از کش Bootstrap)
    const modals = [
      '#imageModal .modal-body',
      '#voiceModal .modal-body',
      '#pdfModal .modal-body',
      '#fileModal .modal-body',
      '#videoModal .modal-body'
    ];

    modals.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.innerHTML = '';   // Bootstrap cache cleanup
    });
  }


  base64ToBlob(base64: string, fileType: string) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    return new Blob([new Uint8Array(byteArrays)], { type: fileType });
  }


  // ============================================================
  // هندل ویس از کامپوننت ضبط صدا
  // ============================================================
  onVoiceReadyForUpload(payload: {
    base64: string;
    transcript: string;
  }) {
    this.FileForm.patchValue({
      Title: 'Voice',
      FileName: `voice_${new Date().getTime()}`,
      FileType: 'mp3',
      File: payload.base64,
      LetterRef: this.LetterRef,
      CentralRef: this.CentralRef
    });

    this.UploadFile();

    // اگر خواستی متن ویس هم به‌صورت پیام متنی ارسال شود:
    if (payload.transcript?.trim()) {
      const cleanMessage = this.convertToEnglishDigits(payload.transcript.trim());
      this.repo.Conversation_Insert(this.LetterRef, this.CentralRef, cleanMessage)
        .subscribe(() => this.GetAutConversation());
    }
  }

  // ============================================================
  // دانلود فایل (برگرفته از نسخه قدیم)
  // ============================================================
  DownloadFile(msg: any) {
    // فرض: API‌ای شبیه نسخه قدیم داری
    const editFormAttach = {
      Title: msg.Description,
      PixelScale: '1000',
      ClassName: 'Aut',
      ObjectRef: this.LetterRef,
      ConversationRef: msg.Id
    };

    this.loadingService.show();
    this.repo.GetConversationFileFromAttach(editFormAttach)
      .subscribe({
        next: (data: any) => {
          this.loadingService.hide();
          if (!data || !data.text || !data.contentType || !data.fileName) {
            this.notificationService.error('فایل نامعتبر است');
            return;
          }

          const byteCharacters = atob(data.text);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: data.contentType });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.loadingService.hide();
          this.notificationService.error('خطا در دانلود فایل');
        }
      });
  }
  openModal(id: string) {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: true
    });

    modal.show();
  }

  closeModal(id: string) {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }


}
