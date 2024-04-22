import { AfterViewInit, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { NotificationService } from '../../framework-services/notification.service'
import { ServiceBase } from '../../framework-services/service.base'
import { SettingService } from '../../framework-services/setting.service'
import { AgGridBaseComponent } from '../ag-grid-base/ag-grid-base.component'
import { ModalComponent } from './modal.component'
import { ModalConfig } from './modal.config'
import { LocalStorageService } from '../../framework-services/local.storage.service'
declare var $: any

@Component({
  selector: 'app-modal-form-base',
  template: ''
})
export class ModalFormBaseComponent<T extends ServiceBase, TModel> extends AgGridBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  title: string
  form: FormGroup
  records: TModel[] = []
  modalConfig = new ModalConfig()

  @Output() afterListFetch = new EventEmitter()
  @Output() afterEntityFetch = new EventEmitter()
  @Output() afterFormSubmit = new EventEmitter<number>()
  @Output() afterDelete = new EventEmitter()
  @Output() afterReset = new EventEmitter()

  @ViewChild('opsModal') private opsModalComponent: ModalComponent

  constructor(
    @Inject(String) title,
    @Inject(ServiceBase) readonly service: T,
    readonly notificationService: NotificationService,
    localStorageService: LocalStorageService,
    settingService: SettingService
  ) {
    super(localStorageService, settingService)
    this.title = title
    // this.afterGridReady
    //   .subscribe(_ => {
    //     this.getList()
    //   })
  }

  override ngOnInit(): void {
    super.ngOnInit()
    this.getList()
  }

  ngAfterViewInit(): void {
  }

  getList() {
    this.service
      .getList<TModel[]>()
      .subscribe(data => {
        this.records = data
        this.afterListFetch.emit()
      })
  }

  delete(id) {
    this.fireDeleteSwal().then((t) => {
      if (t.value === true) {
        this.deleteRecord(id)
      } else {
        this.dismissDeleteSwal(t)
      }
    })
  }

  deleteRecord(id) {
    this.service
      .delete(id)
      .subscribe(() => {
        this.getList()
        this.fireDeleteSucceddedSwal()
        this.afterDelete.emit()
      })
  }

  openOpsModal(guid = null) {
    if (guid) {
      this.service
        .getForEdit(guid)
        .subscribe(data => {
          this.modalConfig.modalTitle = `ویرایش ${this.title}`
          this.form.patchValue(data)
          this.afterEntityFetch.emit()
        })
    }
    else {
      this.form.reset()
      this.afterReset.emit()
      this.modalConfig.modalTitle = `ایجاد ${this.title}`
    }

    this.opsModalComponent.open()
  }

  activate(guid: string) {
    this.service
      .activate(guid)
      .subscribe(() => {
        this.getList()
      })
  }

  deactivate(guid: string) {
    this.service
      .deactivate(guid)
      .subscribe(() => {
        this.getList()
      })
  }

  submit(action) {
    const command = this.form.value

    if (command.guid) {
      this.service
        .edit(command)
        .subscribe(data => {
          this.handleCreateEditOps(action)
        })
    } else {
      this.service
        .create(command)
        .subscribe(guid => {
          this.handleCreateEditOps(action)
        })
    }
  }

  handleCreateEditOps(action) {
    if (action == "new") {
      this.form.reset()
      this.modalConfig.modalTitle = `ایجاد ${this.title}`
    }
    else if (action == "exit") {
      this.opsModalComponent.close()
    }

    this.afterFormSubmit.emit()
    this.getList()
    this.notificationService.succeded()
  }

  ngOnDestroy(): void {
    this.afterListFetch.unsubscribe()
    this.afterFormSubmit.unsubscribe()
    this.afterDelete.unsubscribe()
    this.afterReset.unsubscribe()
  }

  modalClosed() {
    this.form.enable()
    this.form.reset()
    $('#submitForm').removeClass('was-validated')
  }
}