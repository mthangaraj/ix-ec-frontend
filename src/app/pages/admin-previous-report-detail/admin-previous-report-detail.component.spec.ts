import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreviousReportDetailComponent } from './admin-previous-report-detail.component';

describe('AdminPreviousReportDetailComponent', () => {
  let component: AdminPreviousReportDetailComponent;
  let fixture: ComponentFixture<AdminPreviousReportDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPreviousReportDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPreviousReportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
