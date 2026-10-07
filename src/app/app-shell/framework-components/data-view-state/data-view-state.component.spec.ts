import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DataViewStateComponent } from './data-view-state.component';

describe('DataViewStateComponent', () => {
  let fixture: ComponentFixture<DataViewStateComponent>;
  let component: DataViewStateComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataViewStateComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(DataViewStateComponent);
    component = fixture.componentInstance;
  });

  it('announces loading without exposing an action', () => {
    component.state = 'loading';
    component.actionLabel = 'تلاش مجدد';
    fixture.detectChanges();

    const state = fixture.debugElement.query(By.css('section')).nativeElement as HTMLElement;
    expect(state.getAttribute('role')).toBe('status');
    expect(state.getAttribute('aria-busy')).toBe('true');
    expect(fixture.debugElement.query(By.css('button'))).toBeNull();
  });

  it('uses an assertive alert for errors', () => {
    component.state = 'error';
    fixture.detectChanges();

    const state = fixture.debugElement.query(By.css('section')).nativeElement as HTMLElement;
    expect(state.getAttribute('role')).toBe('alert');
    expect(state.getAttribute('aria-live')).toBe('assertive');
  });

  it('emits its keyboard-accessible button action', () => {
    const action = jasmine.createSpy('action');
    component.state = 'empty';
    component.actionLabel = 'ایجاد مورد جدید';
    component.action.subscribe(action);
    fixture.detectChanges();

    fixture.debugElement.query(By.css('button')).triggerEventHandler('click');
    expect(action).toHaveBeenCalledTimes(1);
  });
});
