import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
    selector: 'app-task-edit',
    templateUrl: './task-edit.component.html',
    standalone: false
})
export class TaskEditComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private readonly notificationService: NotificationService,
    private loadingService: LoadingService,
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
  Parent_lvl7: any[] = [];
  Parent_lvl8: any[] = [];
  Parent_lvl9: any[] = [];


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
    ParentCode7: new FormControl(''),
    ParentCode8: new FormControl(''),
    ParentCode9: new FormControl(''),

    ParentName1: new FormControl(''),
    ParentName2: new FormControl(''),
    ParentName3: new FormControl(''),
    ParentName4: new FormControl(''),
    ParentName5: new FormControl(''),
    ParentName6: new FormControl(''),
    ParentName7: new FormControl(''),
    ParentName8: new FormControl(''),
    ParentName9: new FormControl(''),

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
      this.loadingService.show()

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
        this.loadingService.hide()


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
        this.loadingService.hide()

      });


  }

  GetParent_lvl2() {

    this.Parent_lvl3 = [];
    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

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
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];
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
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];
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
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode4,

    });

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl5 = data.KowsarTasks;
      });


  }

  GetParent_lvl6() {

    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode5,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl6 = data.KowsarTasks;
      });


  }

  GetParent_lvl7() {
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode6,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl7 = data.KowsarTasks;
      });


  }


  GetParent_lvl8() {

    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode7,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl8 = data.KowsarTasks;
      });


  }


  GetParent_lvl9() {

    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode8,

    });
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.Parent_lvl9 = data.KowsarTasks;
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
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.GetParent_lvl1()
  }

  submit(action) {

    this.EditForm_task.markAllAsTouched();

    if (!this.EditForm_task.valid) return;



    if (this.Code.length > 0) {

      this.loadingService.show()

      this.repo.UpdateTask(this.EditForm_task.value)
        .subscribe((data: any) => {
          this.notificationService.succeded();
          this.loadingService.hide()

          if (action == 'edit_back') {

            this.location.back()
          } else if (action == 'edit_new') {

            this.reset()

          }



        });

    } else {
      this.loadingService.show()

      this.repo.InsertTask(this.EditForm_task.value)
        .subscribe((data: any) => {
          this.notificationService.succeded();
          this.loadingService.hide()

          if (action == 'insert_back') {

            this.location.back()

          } else if (action == 'insert_new') {

            this.reset()
          }
        });


    }


  }



}

