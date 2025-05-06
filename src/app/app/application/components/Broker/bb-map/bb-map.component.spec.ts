/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { BbMapComponent } from './bb-map.component';

describe('BbMapComponent', () => {
  let component: BbMapComponent;
  let fixture: ComponentFixture<BbMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
