import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../auth/auth.service';
import { EventEmitter } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authService = { hasCurrentSession: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
    })
    .overrideComponent(HeaderComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: EventEmitter, useValue: new EventEmitter() }
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

  it('should set hasValidSession to true when session exists', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.hasValidSession).toBe(true);
  });

  it('should set hasValidSession to false when no session exists', () => {
    authService.hasCurrentSession.mockReturnValue(false);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.hasValidSession).toBe(false);
  });

  it('should emit hideSidebar event when toggleMenu is called', () => {
    authService.hasCurrentSession.mockReturnValue(true);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component.hideSidebar, 'emit');
    component.toggleMenu();
    expect(spy).toHaveBeenCalledWith({});
  });
});
