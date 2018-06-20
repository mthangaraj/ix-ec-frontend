import { TestBed, inject } from '@angular/core/testing';

import { SignoffService } from './signoff.service';

describe('SignoffService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignoffService]
    });
  });

  it('should be created', inject([SignoffService], (service: SignoffService) => {
    expect(service).toBeTruthy();
  }));
});
