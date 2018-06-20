import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaMatchmakingConfirmComponent } from './coa-matchmaking-confirm.component';

describe('CoaMatchmakingConfirmComponent', () => {
  let component: CoaMatchmakingConfirmComponent;
  let fixture: ComponentFixture<CoaMatchmakingConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoaMatchmakingConfirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoaMatchmakingConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
