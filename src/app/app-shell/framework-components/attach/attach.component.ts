import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AttachService } from '../../framework-services/attach.service';
import { USER_ID_NAME } from '../../framework-services/configuration';
import { LocalStorageService } from '../../framework-services/local.storage.service';
import { SwalService } from '../../framework-services/swal.service';
import { getServiceUrl } from 'src/environment/environment';
declare var $: any;

@Component({
  selector: 'app-attach',
  templateUrl: './attach.component.html',
})
export class AttachComponent implements OnInit {
  currentUserId: number;
  newAttach;
  newDescription;
  newEngDescription;

  @Input() table: string;
  @Input() isInViewMode: boolean;
  @Input() useSecondLang: boolean;
  @Input() isModal = false;

  @Input() set masterId(value) {
    this.attachFrm.get('masterId').setValue(value);
    if (this.isModal) {
      this.getAttaches();
    }
  }

  @Output() count: EventEmitter<number> = new EventEmitter();

  attachFrm = new FormGroup({
    masterId: new FormControl(),
    attaches: new FormArray([]),
  });

  get attaches(): FormArray {
    return this.attachFrm.get('attaches') as FormArray;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly attachService: AttachService,
    private readonly swalService: SwalService,
    private readonly localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    if (!this.isModal) {
      this.getAttaches();
    }
  }

  createAttachControl(
    description = null,
    engDescription = null,
    attach = '',
    attachName = null,
    attachExtension = null,
    path = '',
    id = 0,
    creationDate = new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    creatorName = '',
    creator = this.currentUserId
  ) {
    return this.fb.group({
      id,
      creationDate,
      creatorName,
      creator,
      description,
      engDescription,
      attachName,
      attachExtension,
      path,
      attach,
      canEdit: false,
    });
  }

  getAttaches() {
    const masterId = this.attachFrm.get('masterId').value;
    if (!masterId) {
      this.addAttach();
      return;
    }
    this.attachService
      .getListByMasterId(masterId, this.table)
      .subscribe((data) => {
        if (this.isModal) {
          this.attaches.clear();
        }

        data.forEach((attach) => {
          const path = `../assets/images/file-icons/${attach.attachExtension}.svg`;
          const formGroup = this.createAttachControl(
            attach.description,
            attach.engDescription,
            '',
            attach.attachName,
            attach.attachExtension,
            path,
            attach.id,
            attach.creationDate,
            attach.creatorName,
            attach.creator
          );

          this.currentUserId = parseInt(
            this.localStorageService.getItem(USER_ID_NAME)
          );
          if (formGroup.get('creator').value !== this.currentUserId) {
            formGroup.disable();
          }

          this.attaches.push(formGroup);
        });

        this.emitCount();
      });
  }

  addAttach() {
    const attach = this.createAttachControl(
      this.newDescription,
      this.newDescription,
      this.newAttach
    );

    const file = this.newAttach;
    if (file.size > 5000000) {
      $.NotificationApp.send(
        'خطا!',
        'حجم فایل بیش از حد مجاز است',
        'top-right',
        '#bf441d',
        'error'
      );
      return;
    }

    attach.get('attach').setValue(file);
    attach.get('attach').updateValueAndValidity();

    this.submit(attach);
    this.newDescription = null;
    this.newEngDescription = null;
    this.emitCount();
  }

  removeAttach(index) {
    this.swalService
      .fireSwal(
        'آیا از حذف یادداشت اطمینان دارید؟',
        'توجه داشته باشید که حذف اطلاعات وابسته سند، در لحظه اعمال خواهد شد.'
      )
      .then((t: { value: boolean }) => {
        if (t.value === true) {
          const id = this.attaches.controls[index].get('id').value;
          if (!id) return;
          this.attachService.deleteAttach(this.table, id).subscribe(() => {
            this.attaches.removeAt(index);
            this.emitCount();
          });
        } else {
          this.swalService.dismissSwal(t);
        }
      });
  }

  submit(attach) {
    const masterId = this.attachFrm.get('masterId').value;
    const command = attach.value;

    var formData = new FormData();
    formData.append('id', command.id);
    formData.append('table', this.table);
    formData.append('description', command.description);
    formData.append('engDescription', command.engDescription);
    formData.append('attach', command.attach);
    formData.append('masterId', masterId);

    if (command.id) {
      this.attachService.editWithFile(formData).subscribe((data) => {
        attach.get('attachName').setValue(data.attachName);
        attach
          .get('path')
          .setValue(`../assets/images/file-icons/${data.attachExtension}.svg`);
        this.goToEditMode(attach, false);
      });
    } else {
      this.attachService.createWithFile(formData).subscribe((data: any) => {
        this.attaches.push(attach);
        attach.get('id').setValue(data.id);
        attach.get('creatorName').setValue(data.creatorName);
        attach.get('attachName').setValue(data.attachName);
        attach
          .get('path')
          .setValue(`../assets/images/file-icons/${data.attachExtension}.svg`);
        this.emitCount();
      });
    }
  }

  setDocument(event: any, attach) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file.size > 5000000) {
      $.NotificationApp.send(
        'خطا!',
        'حجم فایل بیش از حد مجاز است',
        'top-right',
        '#bf441d',
        'error'
      );
      return;
    }

    attach.get('attach').setValue(file);
    attach.get('attach').updateValueAndValidity();
    this.submit(attach);
  }

  download(attach) {
    const id = attach.get('id').value;
    const attachName = attach.get('attachName').value;
    var token = 'ddd';
    // var token = this.authenticationService.getToken();
    fetch(`${getServiceUrl()}Attach/Download/${this.table}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((resp) => resp.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.id = `file-${id}`;
        a.href = url;
        a.download = attachName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        $(`#${a.id}`).remove();
      })
      .catch(() => {});
  }

  emitCount() {
    this.count.emit(this.attaches.controls.length);
  }

  newAttachAdded(event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file.size > 5000000) {
      $.NotificationApp.send(
        'خطا!',
        'حجم فایل بیش از حد مجاز است',
        'top-right',
        '#bf441d',
        'error'
      );
      return;
    }

    this.newAttach = file;
  }

  canEditAttach(attach) {
    return attach.get('canEdit').value;
  }

  goToEditMode(attach, mode) {
    const index = this.attaches.controls.indexOf(attach);
    this.attaches.controls[index].get('canEdit').setValue(mode);
  }
}
