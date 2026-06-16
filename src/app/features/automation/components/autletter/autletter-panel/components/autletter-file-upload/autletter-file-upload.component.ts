import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-autletter-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `

<div class="d-inline-block">

  <input
    type="file"
    #fileInput
    style="display: none;"
    (change)="onFileSelected($event)" />

  <button
    type="button"
    class="kws-attach-btn"
    (click)="fileInput.click()">

    <i class="mdi mdi-paperclip"></i>

  </button>

</div>

`,
  styles: [`

  .kws-attach-btn {

    width: 48px;

    height: 48px;

    border: none;

    outline: none;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;

    background:
      linear-gradient(
        135deg,
        #ffffff,
        #f3f6fb
      );

    color:
      #0d47a1;

    cursor:
      pointer;

    transition:
      .2s ease;

    box-shadow:
      0 6px 18px rgba(0, 0, 0, .06);

    border:
      1px solid rgba(255, 204, 51, .24);
  }

  .kws-attach-btn i {

    font-size:
      22px;
  }

  .kws-attach-btn:hover {

    transform:
      translateY(-2px);

    background:
      linear-gradient(
        135deg,
        rgba(13,110,253,.08),
        rgba(255,204,51,.14)
      );

    box-shadow:
      0 10px 24px rgba(255,204,51,.16);
  }

`]
})
export class AutletterFileUploadComponent {

  @Output() fileReady = new EventEmitter<{
    Title: string;
    FileName: string;
    ObjectRef: string;
    ClassName: string;
    Type: string;
    FilePath: string;
    FileType: string;
    File: string;

  }>();


  selectedImage: string | ArrayBuffer | null = null;
  selectedFileName = signal('')
  selectedFileSize: number = 0;
  selectedFileType = signal('')

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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result.split(',')[1];

      this.selectedImage = e.target.result; // Get the base64 image data
      this.selectedFileName.set(file.name.replace(' ', '').split('.')[0])
      this.selectedFileSize = Math.round(file.size / 1024); // Convert size to KB and round it

      const fileNameParts = file.name.replace(/\s/g, '').split('.');
      const fileName = fileNameParts[0];
      this.selectedFileType.set(file.type.split('/')[1] || '')





      if (this.selectedFileType() === 'x-zip-compressed' || this.selectedFileType() === 'x-compressed') {
        this.selectedFileType.set('rar');
      }

      if (this.selectedFileType().length < 1 || this.selectedFileType().length > 10) {
        alert('فایل ناشناخته است، به حالت فشرده تبدیل کنید.');
        return;

      }

      const fileSizeMB = file.size / (1024 * 1024);

      const maxSizeMB = 20;

      if (fileSizeMB > maxSizeMB) {

        Swal.fire({

          icon: 'warning',

          title: 'حجم فایل بیش از حد مجاز است',

          text: 'حداکثر حجم مجاز برای آپلود فایل 20 مگابایت می‌باشد.',

          confirmButtonText: 'متوجه شدم',

          confirmButtonColor: '#0d6efd'

        });

        return;
      }


      const fileCategory = this.getFileCategory(file.type, file.name);
      console.log(fileCategory)
      console.log(this.selectedFileName())
      console.log(this.selectedFileType())
      console.log(base64)


      this.fileReady.emit({
        Title: fileCategory,
        FileName: this.selectedFileName(),
        ObjectRef: "0",
        ClassName: "Aut",
        Type: "",
        FilePath: "",
        FileType: this.selectedFileType(),
        File: base64,
      });
    };

    reader.readAsDataURL(file);
  }

  getFileCategory(contentType: string, fileName?: string): string {
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType.startsWith('audio/')) return 'Voice';
    if (contentType.startsWith('video/')) return 'Video';
    if (contentType === 'application/pdf') return 'PDF';
    if (contentType === 'application/json') return 'JSON';
    if (
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      contentType === 'application/msword'
    ) return 'Word';
    if (
      contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      contentType === 'application/vnd.ms-excel'
    ) return 'Excel';
    if (
      contentType === 'application/zip' ||
      contentType === 'application/x-rar-compressed' ||
      contentType === 'application/x-7z-compressed'
    ) return 'Compressed';

    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      switch (ext) {
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'webp':
          return 'Image';
        case 'mp3': case 'wav': case 'ogg': case 'm4a':
          return 'Voice';
        case 'mp4': case 'avi': case 'mov': case 'wmv': case 'mkv':
          return 'Video';
        case 'pdf':
          return 'PDF';
        case 'json':
          return 'JSON';
        case 'doc': case 'docx':
          return 'Word';
        case 'xls': case 'xlsx':
          return 'Excel';
        case 'zip': case 'rar': case '7z':
          return 'Compressed';
      }
    }

    return 'Other';
  }
}
