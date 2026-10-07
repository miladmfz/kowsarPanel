/* tslint:disable:no-unused-variable */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InternalNewsListComponent } from './internal-news-list.component';

describe('InternalNewsListComponent', () => {
  let component: InternalNewsListComponent;
  let fixture: ComponentFixture<InternalNewsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalNewsListComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalNewsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
