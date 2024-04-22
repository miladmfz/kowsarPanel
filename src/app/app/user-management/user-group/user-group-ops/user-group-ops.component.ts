import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router, ParamMap } from '@angular/router'
import { FeatureService } from '../../services/feature.service'
import { UserGroupService } from '../../services/user-group.service'
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages'
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service'
declare var $: any

@Component({
  selector: 'app-user-group-ops',
  templateUrl: './user-group-ops.component.html'
})
export class UserGroupOpsComponent implements OnInit {

  title = "ایجاد گروه کاربران"
  userGroupGuid: string
  features = []
  selectedPermissions = []
  userGroupOpsFrm = new FormGroup({
    id: new FormControl(),
    title: new FormControl('', Validators.required),
    permissions: new FormControl()
  })
  rows: any[]

  constructor(
    private readonly userGroupService: UserGroupService,
    private readonly featureService: FeatureService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const guid = params.get('guid')
      if (guid != null) {
        this.userGroupGuid = guid
        this.getUserGroupDetails()
      }
      this.getFeatures()
    })
  }

  getFeatures() {
    this.featureService
      .getListBy(this.userGroupGuid)
      .subscribe(data => {
        data.forEach(item => {

          if (data.find(x => x.parent == item.id && x.selected)) {
            item.state = { undetermined: true }
          } else if (data.find(x => x.parent != item.id && x.selected)) {
            item.state = { selected: item.selected }
          }

          if (item.selected)
            this.selectedPermissions.push(item.id)

        })

        $("#basicTree").jstree({
          checkbox: {
            "keep_selected_style": false
          },
          core: {
            "check_callback": true,
            themes: { responsive: !1 },
            'data': data,
          },
          types: {
            default: { icon: "fa fa-folder text-warning" }
          },
          plugins: ["types", "search", "checkbox"],
        })

        var to
        $('#plugins4_q').keyup(function () {
          if (to) { clearTimeout(to) }
          to = setTimeout(function () {
            var v = $('#plugins4_q').val()
            $('#basicTree').jstree(true).search(v)
          }, 250)
        })
      })
  }

  collapseAll() {
    $("#basicTree").jstree("close_all")
  }

  expandAll() {
    $("#basicTree").jstree("open_all")
  }

  getUserGroupDetails() {
    this.userGroupService
      .getBy(this.userGroupGuid)
      .subscribe(data => {
        this.userGroupOpsFrm.patchValue(data)
      })
  }

  onBtnCancelClick() {
    this.router.navigateByUrl('/user-management/user-group/list')
  }

  submit(action) {
    const command = this.userGroupOpsFrm.value
    command.permissions = $("#basicTree").jstree("get_selected")
    const undetermined = $("#basicTree").jstree("get_undetermined")
    undetermined.forEach(item => {
      command.permissions.push(item)
    })

    if (!this.userGroupGuid) {
      this.userGroupService.create(command).subscribe(id => {
        this.handleCreateEditOps(action, id)
      })
    } else {
      command.id = this.userGroupGuid
      this.userGroupService.edit(command).subscribe(() => {
        this.handleCreateEditOps(action, this.userGroupGuid)
      })
    }
  }

  handleCreateEditOps(action, id) {
    if (action == "new") {
      this.userGroupOpsFrm.reset()
      this.title = 'ایجاد گروه کاربران'
      this.userGroupGuid = undefined
      document.getElementById("code").focus()
    }
    else if (action == "exit") {
      this.router.navigateByUrl('/user-management/user-group/list')
    }
    else {
      this.title = 'ویرایش گروه کاربران'
      this.router.navigateByUrl(`/user-management/user-group/edit/${id}`)
    }

    this.notificationService.succeded(operationSuccessful)
  }

  onFeatureAdded(id) {
    this.selectedPermissions.push(id)
  }

  onFeatureRemoved(id) {
    const permissionIndex = this.selectedPermissions.findIndex(x => x.id == id)
    this.selectedPermissions.splice(permissionIndex, 1)
  }
}
