import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CentralWebApiService } from '../../../services/CentralWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionCentralList } from './cell-action-central-list';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
@Component({
    selector: 'app-central-list',
    templateUrl: './central-list.component.html',
    standalone: false
})
export class CentralListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: CentralWebApiService,
    private themeService: ThemeService,
    private renderer: Renderer2,
    private readonly notificationService: NotificationService,

  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }

  records;
  title = 'لیست اجزای پایه ';
  dateValue = new FormControl();
  CentralRef: string = '';
  JobPersonRef: string = '';

  Searchtarget: string = '';
  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';
  loading: boolean = true;
  CentralName: string = '';
  private searchSubject: Subject<string> = new Subject();



  EditForm_address = new FormGroup({
    AddressCode: new FormControl(''),
    CentralRef: new FormControl(''),
    AddressTitle: new FormControl(''),
    CityCode: new FormControl(''),
    Address: new FormControl(''),
    ZipCode: new FormControl(''),
    PostCode: new FormControl(''),
    Phone: new FormControl(''),
    Fax: new FormControl(''),
    Mobile: new FormControl(''),
    Email: new FormControl(''),
    MobileName: new FormControl(''),
  });




  ngOnDestroy(): void {
    this.searchSubject.unsubscribe();
    this.themeSub.unsubscribe();
  }

  onInputChange() {
    if (this.Searchtarget == " ") {
      this.Searchtarget = "%"
    }
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
        cellRenderer: CellActionCentralList,
        cellRendererParams: {
          editUrl: '/support/central-edit',
        },
        width: 150,
      },
      {
        field: 'CentralCode',
        headerName: 'CentralCode',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        width: 80,
      },
      {
        field: 'Name',
        headerName: 'Name',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 300

      },
      {
        field: 'Title',
        headerName: 'Title',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

      {
        field: 'FName',
        headerName: 'FName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'Manager',
        headerName: 'Manager',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'Delegacy',
        headerName: 'Delegacy',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'CentralName',
        headerName: 'CentralName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

    ];

    this.searchSubject.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {

      this.getList();
    });
    this.searchSubject.next(this.Searchtarget);


  }


  getList() {


    this.loading = true
    this.repo.GetKowsarCentral(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Centrals;
      this.loading = false

    });


  }



  Address_Central(CentralCode, CentralName) {

    this.CentralName = CentralName
    this.repo.GetAddress(CentralCode).subscribe((data: any) => {


      if (data?.response?.StatusCode === '1000') {
        this.notificationService.warning("آدرسی یافت نشد");
        return;
      }


      this.EditForm_address.patchValue({
        AddressCode: data.Address[0].AddressCode,
        CentralRef: data.Address[0].CentralRef,
        AddressTitle: data.Address[0].AddressTitle,
        CityCode: data.Address[0].CityCode,
        Address: data.Address[0].Address,
        ZipCode: data.Address[0].ZipCode,
        PostCode: data.Address[0].PostCode,
        Phone: data.Address[0].Phone,
        Fax: data.Address[0].Fax,
        Mobile: data.Address[0].Mobile,
        Email: data.Address[0].Email,
        MobileName: data.Address[0].MobileName,
      });


      console.log(this.EditForm_address.value)
      this.centraladdress_dialog_show()

    });


  }


  Set_centraladdress() {



    this.repo.UpdateAddress(this.EditForm_address.value).subscribe((data: any) => {
      this.notificationService.succeded();
      this.centraladdress_dialog_close()

    });


  }




  navigateToEdit(id) {
    this.router.navigate(['/support/central-edit', id]);
  }

  centraladdress_dialog_show() {
    const modal = this.renderer.selectRootElement('#centraladdress', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  centraladdress_dialog_close() {
    const modal = this.renderer.selectRootElement('#centraladdress', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
}

