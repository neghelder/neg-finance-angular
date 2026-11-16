import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideBarComponent } from './side-bar.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the income-tax page accessible when the sidebar is collapsed', () => {
    component.collapsed = true;
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[aria-label="Imposto de renda"]');
    expect(link.getAttribute('href')).toBe('/income-tax');
    expect(link.querySelector('mat-icon').textContent).toBe('receipt_long');
  });
});
