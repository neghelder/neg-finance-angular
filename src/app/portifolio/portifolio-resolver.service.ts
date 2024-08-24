import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { PortifolioService } from './portifolio.service';

@Injectable({
  providedIn: 'root'
})
export class PortifolioResolverService implements Resolve<any> {

  constructor(private portifolio: PortifolioService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.portifolio.portifolio$;
  }
}
