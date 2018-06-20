import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignoffComponent } from './signoff.component';

describe('SignoffComponent', () => {
  let component: SignoffComponent;
  let fixture: ComponentFixture<SignoffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignoffComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignoffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
