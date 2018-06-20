import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCompanyDashboardComponent } from './admin-company-dashboard.component';

describe('AdminCompanyDashboardComponent', () => {
  let component: AdminCompanyDashboardComponent;
  let fixture: ComponentFixture<AdminCompanyDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCompanyDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompanyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
