import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiDashboard, BiManagementPack } from '../../../services/BiWebApi/bi.models';
import { BiHomeComponent } from './bi-home.component';

describe('BiHomeComponent', () => {
  let fixture: ComponentFixture<BiHomeComponent>;
  let api: jasmine.SpyObj<BiWebApiService>;

  const dashboard: BiDashboard = {
    dashboardCode: 12, title: 'Sales Executive', isDefault: false, isFavorite: true,
    lastViewedAt: '2026-09-29T10:00:00Z', packKey: 'sales-executive', createdAt: '', updatedAt: '', rowVersion: '',
    filters: { fromDate: '', toDate: '', grain: 'month', departmentRefs: [], comparisonMode: 'none', comparisonFromDate: '', comparisonToDate: '' },
    widgets: [],
  };
  const pack: BiManagementPack = {
    packKey: 'cash-receivables', title: 'Cash / Receivables', domain: 'Cash', description: 'جریان نقد', datasetKey: 'cash.flow',
    primaryKpis: ['cash.net_flow'], drivers: ['cash.receive_count'], guardrails: ['cash.inflow_outflow_ratio'], isInstalled: false, dashboardCode: null,
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BiWebApiService>('BiWebApiService', ['getDashboards', 'getManagementPacks', 'installManagementPack', 'setFavorite']);
    api.getDashboards.and.returnValue(of([dashboard])); api.getManagementPacks.and.returnValue(of([pack]));
    api.installManagementPack.and.returnValue(of({ ...dashboard, dashboardCode: 22, packKey: pack.packKey }));
    api.setFavorite.and.returnValue(of({ ...dashboard, isFavorite: false }));
    await TestBed.configureTestingModule({
      imports: [BiHomeComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: BiWebApiService, useValue: api },
        { provide: PermissionService, useValue: { canEditOwnBiDashboard: true, canManageBiCatalog: false } }],
    }).compileComponents();
    fixture = TestBed.createComponent(BiHomeComponent); fixture.detectChanges();
  });

  it('shows favorite, recent and governed management packs', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('منتخب‌های من'); expect(text).toContain('مشاهده‌های اخیر'); expect(text).toContain('Cash / Receivables');
  });

  it('installs a pack and opens its personal dashboard', () => {
    const router = TestBed.inject(Router); spyOn(router, 'navigate').and.resolveTo(true);
    (fixture.componentInstance as any).install(pack);
    expect(api.installManagementPack).toHaveBeenCalledOnceWith('cash-receivables');
    expect(router.navigate).toHaveBeenCalledWith(['/accounting/gozareshat/bi/workspace'], { queryParams: { dashboard: 22 } });
  });

  it('updates favorites through the owner-scoped endpoint', () => {
    const event = new Event('click'); spyOn(event, 'preventDefault'); spyOn(event, 'stopPropagation');
    (fixture.componentInstance as any).toggleFavorite(dashboard, event);
    expect(api.setFavorite).toHaveBeenCalledOnceWith(12, false);
    expect((fixture.componentInstance as any).dashboards()[0].isFavorite).toBeFalse();
  });

  it('allows a viewer to keep a personal favorite on a shared dashboard', () => {
    (TestBed.inject(PermissionService) as any).canEditOwnBiDashboard = false;
    (fixture.componentInstance as any).toggleFavorite(dashboard, new Event('click'));
    expect(api.setFavorite).toHaveBeenCalledOnceWith(12, false);
  });
});
