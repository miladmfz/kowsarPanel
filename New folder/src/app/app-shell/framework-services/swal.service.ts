import { Injectable } from '@angular/core';
declare var Swal: any;
declare var $: any;

@Injectable()
export class SwalService {
  fireSwal(text = '', title = '') {
    return Swal.fire({
      title: title,
      text: text,
      type: 'warning',
      icon: 'question',
      showCancelButton: !0,
      confirmButtonText: 'بله، اطمینان دارم.',
      cancelButtonText: 'خیر',
      confirmButtonClass: 'btn btn-success mt-2',
      cancelButtonClass: 'btn btn-danger ml-2 mt-2',
      buttonsStyling: !1,
    });
  }

  fireSucceddedSwal(title) {
    Swal.fire({
      title: title,
      type: 'success',
    });
  }

  dismissSwal(t) {
    t.dismiss === Swal.DismissReason.cancel;
  }
}
