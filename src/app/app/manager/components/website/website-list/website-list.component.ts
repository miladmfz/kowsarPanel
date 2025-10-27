import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { WebSiteWebApiService } from '../../../services/WebSiteWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionWebSiteList } from './cell_action_website_list';
import { debounceTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';

@Component({
    selector: 'app-website-list',
    templateUrl: './website-list.component.html',
    standalone: false
})
export class WebsiteListComponent extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست وب سایت های سامانه';
  loading: boolean = false;

  constructor(
    private readonly router: Router,
    private repo: WebSiteWebApiService,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();
    this.searchSubject.unsubscribe();

  }

  EditForm = new FormGroup({
    SearchTarget: new FormControl(''),
  });

  Searchtarget: string = '';

  private searchSubject: Subject<string> = new Subject();


  onInputChange() {
    if (this.Searchtarget == " ") {
      this.Searchtarget = "%"
    }



    this.EditForm.patchValue({
      SearchTarget: this.Searchtarget,

    });

    this.searchSubject.next(this.Searchtarget);
  }



  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionWebSiteList,
        cellRendererParams: {
          editUrl: '/manager/website-edit',
        },
        width: 150,
      },
      {
        field: 'CompanyName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'WebEmploy',
        headerName: 'مسئول',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Phone',
        headerName: 'شماره تماس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات api',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Domain1',
        headerName: 'دامین',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Features',
        headerName: 'امکانات ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'KCServerVersion',
        headerName: 'KCServerنسخه ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PaymentGateway',
        headerName: 'درگاه بانک',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },




    ];




    this.getList();
    this.searchSubject.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {

      this.getList();
    });

  }

  getList() {

    this.repo.GetWebSiteActivation(this.EditForm.value)
      .subscribe((data) => {
        this.records = data;
      });
  }

  navigateToEdit(id) {
    this.router.navigate(['/manager/website-edit', id]);
  }




}


