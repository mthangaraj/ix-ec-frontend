import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionInactiveComponent } from './session-inactive.component';

describe('SessionInactiveComponent', () => {
  let component: SessionInactiveComponent;
  let fixture: ComponentFixture<SessionInactiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SessionInactiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
