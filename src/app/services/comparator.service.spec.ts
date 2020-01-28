import { TestBed } from '@angular/core/testing';

import { ComparatorService } from './comparator.service';

describe('ComparatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ComparatorService = TestBed.get(ComparatorService);
    expect(service).toBeTruthy();
  });
});
