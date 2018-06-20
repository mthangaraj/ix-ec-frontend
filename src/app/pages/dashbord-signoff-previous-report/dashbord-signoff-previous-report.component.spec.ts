import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordSignoffPreviousReportComponent } from './dashbord-signoff-previous-report.component';

describe('DashbordSignoffPreviousReportComponent', () => {
  let component: DashbordSignoffPreviousReportComponent;
  let fixture: ComponentFixture<DashbordSignoffPreviousReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashbordSignoffPreviousReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashbordSignoffPreviousReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
