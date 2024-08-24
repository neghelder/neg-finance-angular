import { TestBed } from '@angular/core/testing';

import { PortifolioResolverService } from './portifolio-resolver.service';

describe('PortifolioResolverService', () => {
  let service: PortifolioResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortifolioResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
