import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoaMatchComponent } from './coa-match.component';

describe('CoaMatchComponent', () => {
  let component: CoaMatchComponent;
  let fixture: ComponentFixture<CoaMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoaMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoaMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
