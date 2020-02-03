import { TestBed } from '@angular/core/testing';

import { CategorizeService } from './categorize.service';

describe('CategorizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CategorizeService = TestBed.get(CategorizeService);
    expect(service).toBeTruthy();
  });
});
