import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickbookComponent } from './quickbook.component';

describe('QuickbookComponent', () => {
  let component: QuickbookComponent;
  let fixture: ComponentFixture<QuickbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
