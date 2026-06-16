/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InternalNewsEditComponent } from './internal-news-edit.component';

describe('InternalNewsEditComponent', () => {
  let component: InternalNewsEditComponent;
  let fixture: ComponentFixture<InternalNewsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalNewsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalNewsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
