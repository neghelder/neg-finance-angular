import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetTypeSelectorComponent } from './asset-type-selector.component';

describe('AssetTypeSelectorComponent', () => {
  let component: AssetTypeSelectorComponent;
  let fixture: ComponentFixture<AssetTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetTypeSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty options and selectedValue', () => {
    expect(component.options).toEqual([]);
    expect(component.selectedValue).toBe('');
  });

  it('should emit selectionChange when onSelectionChange is called', () => {
    const spy = jest.spyOn(component.selectionChange, 'emit');
    component.onSelectionChange('fiis');
    expect(spy).toHaveBeenCalledWith('fiis');
  });

  it('should accept options input', () => {
    component.options = [
      { label: 'Stocks', value: 'acoes' },
      { label: 'REITs', value: 'fiis' }
    ];
    expect(component.options.length).toBe(2);
  });
});
