import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickbookDesktopComponent } from './quickbook-desktop.component';

describe('QuickbookDesktopComponent', () => {
  let component: QuickbookDesktopComponent;
  let fixture: ComponentFixture<QuickbookDesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickbookDesktopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickbookDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
