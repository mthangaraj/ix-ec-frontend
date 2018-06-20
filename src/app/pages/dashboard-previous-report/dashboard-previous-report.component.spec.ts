import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPreviousReportComponent } from './dashboard-previous-report.component';

describe('DashboardPreviousReportComponent', () => {
  let component: DashboardPreviousReportComponent;
  let fixture: ComponentFixture<DashboardPreviousReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardPreviousReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardPreviousReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
