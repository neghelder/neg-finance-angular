import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';
import { SideBarComponent } from '../../shared/side-bar/side-bar.component';
import { AsyncPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Observable, map, shareReplay } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { PieComponent } from '../../shared/widgets/pie/pie.component';
import { MatDivider, MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-default',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    PieComponent,
    MatDividerModule
  ],
  providers: [
    AuthService
  ],
  templateUrl: './default.component.html',
  styleUrl: './default.component.scss'
})
export class DefaultComponent implements OnInit {

  // isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  //   .pipe(
  //     map(result => result.matches),
  //     shareReplay()
  //   );
  constructor(private auth: AuthService, private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    if(this.auth.hasCurrentSession()) {

    }  
  }

}
