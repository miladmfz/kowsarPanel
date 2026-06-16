import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { Location } from '@angular/common';

import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
import { GoodRelationComponent } from './components/good-relation/good-relation.component';
import { GoodPropertyComponent } from './components/good-property/good-property.component';
import { GoodExplainComponent } from './components/good-explain/good-explain.component';
import { GoodCompleteComponent } from './components/good-complete/good-complete.component';
import { GoodBaseComponent } from './components/good-base/good-base.component';
import { KowsarPropertyComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-property/kowsar-property.component';
@Component({
  selector: 'app-good-edit',
  templateUrl: './good-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GoodBaseComponent,
    GoodCompleteComponent,
    GoodExplainComponent,
    GoodPropertyComponent,
    GoodRelationComponent,
    KowsarPropertyComponent
  ]
})
export class GoodEditComponent implements OnInit {


  private readonly router = inject(Router);
  private readonly repo = inject(GoodWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

  constructor() {
  }


  GoodCode = signal('0')
  GoodCode_int = signal(0)


  onBtnCancelClick() {
    this.location.back()
  }


  ngOnInit(): void {

    this.title.set("مدیریت کالا")
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.GoodCode.set(id)
        this.GoodCode_int.set(parseInt(this.GoodCode()))
      } else {
        this.GoodCode.set("0")
        this.GoodCode_int.set(0)
      }
    });
  }






  // #region Declare
  title = signal('ایجاد نوع داده انتخابی')


  temp_str = signal('')
  SingleItems = signal<any[]>([])


  show_Property = signal(false)

  Show_property() {
    this.property_dialog_show()
  }
  property_dialog_show() {
    this.show_Property.set(true)
    const modal = this.renderer.selectRootElement('#property', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  property_dialog_close() {
    this.show_Property.set(false)
    const modal = this.renderer.selectRootElement('#property', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}







