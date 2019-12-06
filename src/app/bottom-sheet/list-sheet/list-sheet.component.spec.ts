import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSheetComponent } from './list-sheet.component';

describe('ListSheetComponent', () => {
  let component: ListSheetComponent;
  let fixture: ComponentFixture<ListSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
