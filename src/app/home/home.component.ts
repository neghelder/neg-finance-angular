import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SideBarComponent } from '../shared/side-bar/side-bar.component';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { LayoutService } from '../layout/layout.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    SideBarComponent,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  layout = inject(LayoutService);
  private breakpointObserver = inject(BreakpointObserver);
  private breakpointSub?: Subscription;

  isMobile = signal(false);

  ngOnInit(): void {
    this.breakpointSub = this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile.set(result.matches);
        if (result.matches) {
          this.layout.sidebarCollapsed.set(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
  }
}
