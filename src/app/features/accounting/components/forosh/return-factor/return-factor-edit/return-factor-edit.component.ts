import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Subject } from 'rxjs';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  selector: 'app-return-factor-edit',
  templateUrl: './return-factor-edit.component.html',
})
export class ReturnFactorEditComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
