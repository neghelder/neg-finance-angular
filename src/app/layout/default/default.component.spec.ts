import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefaultComponent } from './default.component';
import { AuthService } from '../../auth/auth.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('DefaultComponent', () => {
  let component: DefaultComponent;
  let fixture: ComponentFixture<DefaultComponent>;

  beforeEach(async () => {
    const authServiceMock = { hasCurrentSession: jest.fn().mockReturnValue(true) };
    const breakpointMock = { observe: jest.fn().mockReturnValue(of({ matches: false })) };

    await TestBed.configureTestingModule({
      imports: [DefaultComponent],
    })
    .overrideComponent(DefaultComponent, {
      set: {
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: BreakpointObserver, useValue: breakpointMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
