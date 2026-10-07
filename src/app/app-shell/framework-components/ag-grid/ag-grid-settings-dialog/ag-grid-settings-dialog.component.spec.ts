import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridSettingsDialogService } from '../services/ag-grid-settings-dialog.service';
import { AgGridSettingsDialogComponent } from './ag-grid-settings-dialog.component';

describe('AgGridSettingsDialogComponent', () => {
  let fixture: ComponentFixture<AgGridSettingsDialogComponent>;
  let dialog: AgGridSettingsDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgGridSettingsDialogComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(AgGridSettingsDialogComponent);
    dialog = TestBed.inject(AgGridSettingsDialogService);
    dialog.state.set({
      title: 'فاکتور فروش',
      schemaClassName: 'TGoodFactorRpt',
      loading: false,
      error: '',
      columns: [
        { id: 'FactorCode', field: 'FactorCode', caption: 'شماره فاکتور', defaultCaption: 'شماره فاکتور', width: 120, defaultWidth: 120, visible: true, defaultVisible: true, source: 'GridSchema', separator: false },
        { id: 'Amount', field: 'Amount', caption: 'مبلغ', defaultCaption: 'مبلغ', width: 160, defaultWidth: 140, visible: false, defaultVisible: false, source: 'GridSchema', separator: true },
      ],
    });
    fixture.detectChanges();
  });

  afterEach(() => dialog.close());

  it('renders a single Persian modal with visible and hidden GridSchema columns', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="dialog"]')).not.toBeNull();
    expect(element.textContent).toContain('تنظیمات مشترک جدول');
    expect(element.textContent).toContain('TGoodFactorRpt');
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
    expect(element.querySelectorAll('input[type="checkbox"]:checked').length).toBe(1);
    const captions = Array.from(element.querySelectorAll<HTMLInputElement>('.caption-input')).map(input => input.value);
    expect(captions).toEqual(['شماره فاکتور', 'مبلغ']);
  });
});
