import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreviousReportComponent } from './admin-previous-report.component';

describe('AdminPreviousReportComponent', () => {
  let component: AdminPreviousReportComponent;
  let fixture: ComponentFixture<AdminPreviousReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPreviousReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPreviousReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
