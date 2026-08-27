import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriteriaEditorComponent } from './criteria-editor.component';
import { AnalisysService } from '../analisys.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CriteriaEditorComponent', () => {
  let component: CriteriaEditorComponent;
  let fixture: ComponentFixture<CriteriaEditorComponent>;
  let mockAnalysisService: any;

  beforeEach(async () => {
    mockAnalysisService = {
      getCriteria: jest.fn().mockReturnValue(of({
        SHARE: { BR: { dy: { min: 0.1, max: 0.2, unit: 'perc' }, pl: { min: 0, max: 10, unit: 'number' } } },
        REIT: { BR: { pvp: { max: 1, unit: 'number' } } }
      })),
      saveCriteria: jest.fn().mockImplementation((c) => of(c))
    };

    await TestBed.configureTestingModule({
      imports: [CriteriaEditorComponent],
      providers: [
        { provide: AnalisysService, useValue: mockAnalysisService },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CriteriaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial config and fields', () => {
    expect(component.activeConfig).toBeTruthy();
    expect(component.fieldsList.length).toBe(2);
    expect(component.fieldsList[0].key).toBe('dy');
  });

  it('should transform perc fields to 100x and back on save', () => {
    // dy should be loaded as 10 and 20 instead of 0.1 and 0.2
    expect(component.activeConfig?.['SHARE']['BR']['dy']['min']).toBe(10);
    expect(component.activeConfig?.['SHARE']['BR']['dy']['max']).toBe(20);
    
    // Changing UI value
    if (component.activeConfig) {
      component.activeConfig['SHARE']['BR']['dy']['max'] = 25;
    }

    component.save();
    
    // Check that saveCriteria was called with 0.25
    const saveCall = (mockAnalysisService.saveCriteria as any).mock.calls[0][0];
    expect(saveCall['SHARE']['BR']['dy']['min']).toBe(0.1);
    expect(saveCall['SHARE']['BR']['dy']['max']).toBe(0.25);
  });

  it('should reload fields when asset type changes', () => {
    component.onAssetTypeChange('REIT');
    expect(component.fieldsList[0].key).toBe('pvp');
  });

  it('should save criteria', () => {
    component.save();
    const payload = component.transformValues(component.activeConfig!, false);
    expect(mockAnalysisService.saveCriteria).toHaveBeenCalledWith(payload);
    expect(component.saveSuccess).toBe(true);
  });

  it('should reset criteria to saved config', () => {
    if (component.activeConfig) {
      component.activeConfig['SHARE']['BR']['pl'] = { min: 99, max: 100, unit: 'number' };
    }
    component.resetToDefaults();
    expect(component.activeConfig?.['SHARE']['BR']['pl']['min']).toBe(0);
  });

  describe('FIAGRO asset type option', () => {
    it('should include FIAGROs in assetTypeOptions', () => {
      const fiagro = component.assetTypeOptions.find(o => o.value === 'FIAGRO');
      expect(fiagro).toBeDefined();
      expect(fiagro?.label).toBe('FIAGROs');
    });

    it('should switch fields when FIAGRO asset type selected', () => {
      // Simulate the service returning FIAGRO criteria data
      mockAnalysisService.getCriteria.mockReturnValue(of({
        SHARE: { BR: { dy: { min: 0.1, max: 0.2, unit: 'perc' } } },
        REIT: { BR: { pvp: { max: 1, unit: 'number' } } },
        FIAGRO: { BR: { pvp: { max: 1, unit: 'number' }, liqday: { min: 100000, unit: 'number' } } }
      }));

      // Re-init to pick up new getCriteria return value
      component.ngOnInit();

      component.onAssetTypeChange('FIAGRO');
      component.onOriginChange('BR');

      expect(component.selectedAssetType).toBe('FIAGRO');
      expect(component.fieldsList.length).toBe(2);
      const keys = component.fieldsList.map(f => f.key);
      expect(keys).toContain('pvp');
      expect(keys).toContain('liqday');
    });

    it('should save FIAGRO criteria through the existing save flow', () => {
      mockAnalysisService.getCriteria.mockReturnValue(of({
        FIAGRO: { BR: { pvp: { max: 1, unit: 'number' }, dy: { min: 0.08, unit: 'perc' } } }
      }));

      component.ngOnInit();
      component.onAssetTypeChange('FIAGRO');
      component.onOriginChange('BR');

      component.save();

      const saveCall = (mockAnalysisService.saveCriteria as any).mock.calls.at(-1)[0];
      // dy should be sent back as 0.08 (not 8)
      expect(saveCall['FIAGRO']['BR']['dy']['min']).toBeCloseTo(0.08, 5);
    });
  });
});
