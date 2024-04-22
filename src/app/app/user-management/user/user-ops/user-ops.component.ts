import { AfterViewChecked, Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router, ParamMap } from '@angular/router'
import { UserGroupService } from '../../services/user-group.service'
import { UserService } from '../../services/user.service'
import { UserGroup } from '../../types/user-group'
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service'
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages'
declare var $: any

@Component({
  selector: 'app-user-ops',
  templateUrl: './user-ops.component.html'
})
export class UserOpsComponent implements OnInit, AfterViewChecked {

  title = "ایجاد کاربر"
  userId: number = 0
  userGroups: UserGroup[] = []

  userOpsFrm = new FormGroup({
    id: new FormControl(),
    userGroupId: new FormControl(),
    username: new FormControl('', Validators.required),
    fullname: new FormControl('', Validators.required),
    engFullname: new FormControl('', Validators.required),
    password: new FormControl(),
    rePassword: new FormControl(),
    mobile: new FormControl('', Validators.required),
    email: new FormControl(''),
    companies: new FormControl()
  })

  constructor(
    private readonly userService: UserService,
    private readonly userGroupService: UserGroupService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router) {
  }

  ngAfterViewChecked(): void {
    $("select").trigger("change")
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id')
      if (id != null) {
        this.userId = parseInt(id)
        this.getUserDetails()
      }
    })

    this.userGroupService
      .getForCombo<UserGroup[]>()
      .subscribe(data => this.userGroups = data)
  }

  getUserDetails() {
    this.userService
      .getBy(this.userId)
      .subscribe(data => {
        this.userOpsFrm.patchValue(data)
        $('select').trigger('change')
      })
  }

  onBtnCancelClick() {
    this.router.navigateByUrl('/user-management/user/list')
  }

  submit(action) {
    const command = this.userOpsFrm.value
    command.companies = command.companies.filter(x => x > 0).join(',')
    if (this.userId == 0) {
      this.userService
        .create(command)
        .subscribe(id => {
          this.handleCreateEditOps(action, id)
        })
    } else {
      command.id = this.userId
      this.userService
        .edit(command)
        .subscribe(() => {
          this.handleCreateEditOps(action, this.userId)
          this.userId = 0
        })
    }
  }

  handleCreateEditOps(action, id) {
    if (action == "new") {
      this.userOpsFrm.reset()
      this.title = 'ایجاد کاربر جدید'
      this.userId = 0
      document.getElementById("code").focus()
    }
    else if (action == "exit") {
      this.router.navigateByUrl('/user-management/user/list')
    }
    else {
      this.title = 'ویرایش کاربر'
      this.router.navigateByUrl(`/user-management/user/edit/${id}`)
    }

    this.notificationService.succeded(operationSuccessful)
  }
}
