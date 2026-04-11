import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const breakpointMock = { observe: jest.fn().mockReturnValue(of({ matches: false })) };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    })
    .overrideComponent(DashboardComponent, {
      set: {
        providers: [
          { provide: BreakpointObserver, useValue: breakpointMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
