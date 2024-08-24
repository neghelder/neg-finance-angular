import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  providers: [
    EventEmitter
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  hasValidSession: boolean = false;
  @Output() hideSidebar = new EventEmitter();
  ngOnInit(): void {
    this.hasValidSession = this.auth.hasCurrentSession();
  }

  toggleMenu(): void {
    this.hideSidebar.emit({});
  }
  constructor(private auth: AuthService) {}
}
