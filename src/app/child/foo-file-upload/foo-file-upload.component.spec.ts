import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooFileUploadComponent } from './foo-file-upload.component';

describe('FooFileUploadComponent', () => {
  let component: FooFileUploadComponent;
  let fixture: ComponentFixture<FooFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
