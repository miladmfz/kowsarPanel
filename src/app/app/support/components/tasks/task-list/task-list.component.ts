import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CellActionTaskList } from './cell-action-task-ist';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
})
export class TaskListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private readonly notificationService: NotificationService,
    private themeService: ThemeService,
    private renderer: Renderer2,
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;
  getDataPath_task = (data: any) => data.dataPath;

  EditForm_task = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentName: new FormControl(''),
    Flag: new FormControl('0'),


  });



  // متد برای ساخت مسیر Parent → Child
  getDataPath_group = (task: any): string[] => {
    const path: string[] = [];
    let current = task;

    while (current) {
      path.unshift(current.Title);  // والدها را به ابتدای آرایه اضافه می‌کنیم
      if (current.TaskRef === 0) break;
      current = this.records.find(t => t.TaskCode === current.TaskRef);
    }

    return path;
  };

  // rowData آماده برای AG Grid
  prepareTreeData() {
    this.records = this.records.map(t => ({
      ...t,
      dataPath: this.getDataPath_group(t)
    }));
  }




  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }

  records;
  title = 'لیست خدمات ';
  dateValue = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.EditForm_task.patchValue({
        ParentName: this.Searchtarget,

      });
    }
    this.GetTasks()
  }

  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.getGridSchema()
    this.GetTasks();
  }



  getGridSchema() {

    this.columnDefs6 = [
      {
        headerName: 'عنوان وظیفه',
        field: 'Title',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: { suppressCount: true },
        getDataPath: (data: any) => data.dataPath
      },
      {
        field: 'TaskCode',
        headerName: 'کد',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'شرح وظیفه',
        minWidth: 200
      },
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionTaskList,   // نام کلاس ریجستر شده
        cellRendererParams: {
          editUrl: '/support/task-edit',
        },
        width: 150,
      }
    ];



  }



  GetTasks() {
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.records = data.KowsarTasks;
      });
  }



  delete(TaskCode) {
    this.EditForm_task.patchValue({
      TaskCode: TaskCode,
    });
    this.Loading_Modal_Response_show()

    this.repo.DeleteTask(this.EditForm_task.value).subscribe((data: any) => {

      if (data.KowsarTasks[0].Success == "0") {
        this.Loading_Modal_Response_close()
        this.notificationService.error(data.KowsarTasks[0].Message);

      } else {
        this.Loading_Modal_Response_close()
        this.notificationService.succeded();
        this.EditForm_task.reset()
        this.GetTasks()
      }

    });

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

