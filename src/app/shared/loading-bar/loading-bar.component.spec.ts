import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingBarComponent } from './loading-bar.component';

describe('LoadingBarComponent', () => {
  let component: LoadingBarComponent;
  let fixture: ComponentFixture<LoadingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default loading to false', () => {
    expect(component.loading).toBe(false);
  });

  it('should accept loading input', () => {
    component.loading = true;
    fixture.detectChanges();
    expect(component.loading).toBe(true);
  });
});
