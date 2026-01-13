import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autletter-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <input type="file" (change)="onFileSelected($event)" />
  `
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
  selectedFileName: string = '';
  selectedFileSize: number = 0;
  selectedFileType: string = '';

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
      this.selectedFileName = file.name.replace(' ', '').split('.')[0];
      this.selectedFileSize = Math.round(file.size / 1024); // Convert size to KB and round it

      const fileNameParts = file.name.replace(/\s/g, '').split('.');
      const fileName = fileNameParts[0];
      this.selectedFileType = file.type.split('/')[1] || '';





      if (this.selectedFileType === 'x-zip-compressed' || this.selectedFileType === 'x-compressed') {
        this.selectedFileType = 'rar';
      }

      if (this.selectedFileType.length < 1 || this.selectedFileType.length > 10) {
        alert('فایل ناشناخته است، به حالت فشرده تبدیل کنید.');
        return;

      }

      const fileSizeKB = Math.round(file.size / 1024);
      const maxSizeKB = 20 * 1024; // 20MB
      if (fileSizeKB > maxSizeKB) {
        alert('حجم فایل نباید بیشتر از 20MB باشد!');
        return;
      }


      const fileCategory = this.getFileCategory(file.type, file.name);

      this.fileReady.emit({
        Title: fileCategory,
        FileName: this.selectedFileName,
        ObjectRef: "0",
        ClassName: "Aut",
        Type: "",
        FilePath: "",
        FileType: this.selectedFileType,
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
