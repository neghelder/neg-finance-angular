import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

// ... (other imports)

// Stub child components
@Component({ selector: 'app-header', standalone: true, template: '' })
class MockHeaderComponent {}
@Component({ selector: 'app-footer', standalone: true, template: '' })
class MockFooterComponent {}

describe('AppComponent', () => {
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;

  beforeEach(async () => {
    authService = { hasCurrentSession: jest.fn() } as any;
    router = { navigateByUrl: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
    })
    .overrideComponent(AppComponent, {
      set: {
        imports: [RouterModule, MockHeaderComponent, MockFooterComponent],
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: Router, useValue: router },
        ]
      }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should redirect to /default when no session exists', () => {
    authService.hasCurrentSession.mockReturnValue(false);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/default');
  });

  it('should not redirect when session exists', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
