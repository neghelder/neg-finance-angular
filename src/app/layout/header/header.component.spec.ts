import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../auth/auth.service';
import { LayoutService } from '../layout.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jest.Mocked<AuthService>;
  let layoutService: LayoutService;

  beforeEach(async () => {
    authService = { hasCurrentSession: jest.fn() } as any;
    layoutService = new LayoutService();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    })
    .overrideComponent(HeaderComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: LayoutService, useValue: layoutService },
        ]
      }
    })
    .compileComponents();
  });

  it('should create', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set hasValidSession signal to true when session exists', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.hasValidSession()).toBe(true);
  });

  it('should set hasValidSession signal to false when no session exists', () => {
    authService.hasCurrentSession.mockReturnValue(false);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.hasValidSession()).toBe(false);
  });

  it('should toggle sidebar via LayoutService when onToggleMenu is called', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(layoutService.sidebarCollapsed()).toBe(false);
    component.onToggleMenu();
    expect(layoutService.sidebarCollapsed()).toBe(true);
    component.onToggleMenu();
    expect(layoutService.sidebarCollapsed()).toBe(false);
  });
});
