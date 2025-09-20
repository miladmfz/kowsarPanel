import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
})
export class TaskEditComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private readonly notificationService: NotificationService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private location: Location



  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  Parent_lvl1: any[] = [];
  Parent_lvl2: any[] = [];
  Parent_lvl3: any[] = [];
  Parent_lvl4: any[] = [];
  Parent_lvl5: any[] = [];
  Parent_lvl6: any[] = [];


  EditForm_task = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentCode1: new FormControl(''),
    ParentCode2: new FormControl(''),
    ParentCode3: new FormControl(''),
    ParentCode4: new FormControl(''),
    ParentCode5: new FormControl(''),
    ParentCode6: new FormControl(''),

    ParentName1: new FormControl(''),
    ParentName2: new FormControl(''),
    ParentName3: new FormControl(''),
    ParentName4: new FormControl(''),
    ParentName5: new FormControl(''),
    ParentName6: new FormControl(''),

    Flag: new FormControl('1'),

  });


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }



  Code: string = '';


  title = 'لیست خدمات ';


  ngOnDestroy() {

    this.themeSub.unsubscribe();
  }




  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      this.Loading_Modal_Response_show()

      if (id != null) {
        this.Code = id

        this.title = "اصلاح خدمات "
        // update
        this.GetTaskDetail()

      } else {
        this.Code = ""
        this.title = "ایجاد خدمات جدید"

        this.GetParent_lvl1()
        // new

      }


    });
  }

  GetTaskDetail() {
    this.EditForm_task.patchValue({
      TaskRef: this.Code,
      Flag: "4"
    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.EditForm_task.patchValue({
          TaskCode: data.KowsarTasks[0].TaskCode,
          TaskRef: data.KowsarTasks[0].TaskRef,
          Title: data.KowsarTasks[0].Title,
          Explain: data.KowsarTasks[0].Explain,
          ParentName1: data.KowsarTasks[0].ParentTitle,

        });
        this.Loading_Modal_Response_close()


      });


  }



  GetParent_lvl1() {
    this.EditForm_task.patchValue({
      TaskRef: "0",
      Flag: "1"
    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl1 = data.KowsarTasks;
        this.Loading_Modal_Response_close()

      });


  }

  GetParent_lvl2() {

    this.Parent_lvl3 = [];
    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode1,

    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl2 = data.KowsarTasks;
      });


  }
  GetParent_lvl3() {

    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode2,

    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl3 = data.KowsarTasks;
      });

  }
  GetParent_lvl4() {

    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode3,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl4 = data.KowsarTasks;
      });


  }
  GetParent_lvl5() {

    this.Parent_lvl6 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode4,

    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl5 = data.KowsarTasks;
      });


  }

  GetParent_lvl6() {

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode5,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl6 = data.KowsarTasks;
      });


  }





  reset() {

    this.EditForm_task.reset()
    this.Code = ""
    this.Parent_lvl1 = [];
    this.Parent_lvl2 = [];
    this.Parent_lvl3 = [];
    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.GetParent_lvl1()
  }

  submit(action) {

    this.EditForm_task.markAllAsTouched();

    if (!this.EditForm_task.valid) return;



    if (this.Code.length > 0) {

      this.Loading_Modal_Response_show()

      this.repo.UpdateTask(this.EditForm_task.value)
        .subscribe((data: any) => {
          this.notificationService.succeded();
          this.Loading_Modal_Response_close()

          if (action == 'edit_back') {

            this.location.back()
          } else if (action == 'edit_new') {

            this.reset()

          }



        });

    } else {
      this.Loading_Modal_Response_show()

      this.repo.InsertTask(this.EditForm_task.value)
        .subscribe((data: any) => {
          this.notificationService.succeded();
          this.Loading_Modal_Response_close()

          if (action == 'insert_back') {

            this.location.back()

          } else if (action == 'insert_new') {

            this.reset()
          }
        });


    }


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


}

