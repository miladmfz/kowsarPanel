import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { KowsarBaseWebApi } from '../../../framework-services/base/KowsarBaseWebApi.service';
import { CellActionKowsarAttach } from './cell-action-kowsar-attach';

@Component({
  selector: 'app-kowsar-attach',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './kowsar-attach.component.html',
})
export class KowsarAttachComponent extends AgGridBaseComponent implements OnChanges {

  @Input() ObjectRef = '';
  @Input() ClassName = '';

  records: any[] = [];

  EditForm = new FormGroup({
    Title: new FormControl(''),
    FileName: new FormControl(''),
    ObjectRef: new FormControl(''),
    ClassName: new FormControl(''),
    Type: new FormControl('Zip'),
    FilePath: new FormControl(''),
    FileType: new FormControl(''),
    Data: new FormControl(''),
  });

  selectedFileName = '';
  selectedFileSize = 0;
  selectedFileType = '';

  private readonly repo = inject(KowsarBaseWebApi);
  private readonly notify = inject(NotificationService);
  private readonly loading = inject(LoadingService);

  constructor() {
    super();
  }

  ngOnInit(): void {

    this.columnDefs6 = [
      { field: 'عملیات', pinned: 'left', cellRenderer: CellActionKowsarAttach, minWidth: 180 },
      { field: 'Title', headerName: 'عنوان', minWidth: 130 },
      { field: 'FileName', headerName: 'نام فایل', minWidth: 150 },
      { field: 'CreationDate', headerName: 'تاریخ ایجاد', minWidth: 130 },
    ];
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (this.ObjectRef && this.ClassName) {

      this.EditForm.patchValue({
        ObjectRef: this.ObjectRef,
        ClassName: this.ClassName
      });

      this.GetAttachList();
    }
  }



  // =============================
  // دریافت لیست فایل‌ها
  // =============================

  GetAttachList() {

    this.repo.GetAttachFileList(this.EditForm.value).subscribe({
      next: (resp: any) => {
        this.records = resp.AttachedFiles ?? [];
        this.updateGridData(6, this.records);
      },
      error: () => this.notify.error('خطا در دریافت فایل‌ها'),
    });
  }
  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }



  // =============================
  // انتخاب فایل
  // =============================
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    const compressedFormats = [
      'zip', 'rar', '7z', 'gz', 'gzip', 'tar', 'tgz', 'tar.gz', 'xz', 'tar.xz'
    ];

    if (!compressedFormats.includes(ext || '')) {
      this.notify.warning('فقط فایل‌های فشرده (ZIP, RAR, 7Z, TAR...) قابل بارگذاری هستند');
      (event.target as HTMLInputElement).value = '';
      this.EditForm.patchValue({ FileName: '', FileType: '', Data: '' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const base64 = e.target.result.split(',')[1];

      this.selectedFileName = file.name.replace(/\s/g, '').split('.')[0];
      this.selectedFileSize = Math.round(file.size / 1024);
      this.selectedFileType = ext;

      this.EditForm.patchValue({
        FileName: this.selectedFileName,
        FileType: this.selectedFileType,
        Data: base64,
      });
    };

    reader.readAsDataURL(file);
  }

  // =============================
  // ذخیره
  // =============================
  submit() {

    if (!this.EditForm.get('Data')?.value) {
      this.notify.warning('فایل انتخاب نشده است');
      return;
    }

    if (this.selectedFileSize > 10240) {
      this.notify.warning('حجم فایل بیش از ۱۰MB است');
      return;
    }

    this.loading.show();

    this.repo.AttachFile_Insert(this.EditForm.value).subscribe({
      next: () => {
        this.loading.hide();
        this.notify.success('بارگذاری با موفقیت انجام شد');
        this.Reset_Form()
        this.GetAttachList();
      },
      error: () => {
        this.loading.hide();
        this.notify.error('خطا در بارگذاری فایل');
      },
    });
  }

  Reset_Form() {

    this.EditForm.patchValue({
      Title: "",
      FileName: "",
      ObjectRef: this.ObjectRef,
      ClassName: this.ClassName,
      Type: "Zip",
      FilePath: "",
      FileType: "",
      Data: "",

    });

  }

  // =============================
  // دانلود
  // =============================
  DownloadFile(row: any) {
    this.repo.downloadFile(row.AttachedFileCode, this.ClassName, this.ObjectRef).subscribe({
      next: (res: any) => {
        if (!res?.success) {
          this.notify.error('فایل یافت نشد');
          return;
        }

        const byteChars = atob(res.base64);
        const byteNums = Array.from(byteChars).map(c => c.charCodeAt(0));
        const blob = new Blob([new Uint8Array(byteNums)], {
          type: this.getMimeType(res.fileType),
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `${res.fileName}.${res.fileType}`;
        a.click();

        URL.revokeObjectURL(url);
      },
      error: () => this.notify.error('خطا در دانلود فایل'),
    });
  }

  // =============================
  // حذف
  // =============================
  async DeleteFile(row: any) {
    const Swal = (await import('sweetalert2')).default;

    const confirm = await Swal.fire({
      title: 'حذف فایل؟',
      text: 'مطمئن هستید؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
    });

    if (!confirm.isConfirmed) return;

    this.repo.DeleteAttachFile(row.AttachedFileCode, this.ClassName, this.ObjectRef).subscribe({
      next: () => {
        this.notify.success('فایل حذف شد');
        this.GetAttachList();
      },
      error: () => this.notify.error('خطا در حذف فایل'),
    });
  }

  // =============================
  // MIME TYPE
  // =============================
  getMimeType(ext: string): string {
    if (!ext) return 'application/octet-stream';

    const map: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      bmp: 'image/bmp',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      tiff: 'image/tiff',
      pdf: 'application/pdf',
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      gz: 'application/gzip',
      tar: 'application/x-tar',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
    };

    return map[ext.toLowerCase()] ?? 'application/octet-stream';
  }
}
