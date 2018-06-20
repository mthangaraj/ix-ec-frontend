import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCompanySerachComponent } from './admin-company-serach.component';

describe('AdminCompanySerachComponent', () => {
  let component: AdminCompanySerachComponent;
  let fixture: ComponentFixture<AdminCompanySerachComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCompanySerachComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompanySerachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
