/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GoodTest1Component } from './good-test1.component';

describe('GoodTest1Component', () => {
  let component: GoodTest1Component;
  let fixture: ComponentFixture<GoodTest1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoodTest1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodTest1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
