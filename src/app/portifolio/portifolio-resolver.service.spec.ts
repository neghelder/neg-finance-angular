import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PortifolioResolverService } from './portifolio-resolver.service';
import { PortifolioService } from './portifolio.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('PortifolioResolverService', () => {
  let service: PortifolioResolverService;
  let portifolioService: PortifolioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PortifolioResolverService);
    portifolioService = TestBed.inject(PortifolioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should delegate to PortifolioService.portifolio$', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    const result = service.resolve(route, state);

    expect(result).toBe(portifolioService.portifolio$);
  });
});
