import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AnalisysService } from '../analisys.service';
import { CriteriaConfig, FIELD_LABELS, FieldCriteria } from '../models/criteria';
import { AssetTypeOption, AssetTypeSelectorComponent } from '../../shared/asset-type-selector/asset-type-selector.component';

@Component({
  selector: 'app-criteria-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AssetTypeSelectorComponent],
  templateUrl: './criteria-editor.component.html',
  styleUrl: './criteria-editor.component.scss'
})
export class CriteriaEditorComponent implements OnInit {
  activeConfig: CriteriaConfig | null = null;
  savedConfig: CriteriaConfig | null = null;

  assetTypeOptions: AssetTypeOption[] = [
    { label: 'Shares', value: 'SHARE' },
    { label: 'REITs', value: 'REIT' }
  ];
  selectedAssetType: string = 'SHARE';

  originOptions: AssetTypeOption[] = [
    { label: 'BR', value: 'BR' },
    { label: 'USA', value: 'USA' }
  ];
  selectedOrigin: string = 'BR';

  fieldLabels = FIELD_LABELS;

  fieldsList: { key: string, criteria: FieldCriteria }[] = [];

  saving = false;
  saveSuccess = false;

  constructor(private analysisService: AnalisysService) { }

  transformValues(config: CriteriaConfig, toUI: boolean): CriteriaConfig {
    const newConfig = JSON.parse(JSON.stringify(config));
    
    for (const assetType of Object.keys(newConfig)) {
      for (const origin of Object.keys(newConfig[assetType])) {
        for (const field of Object.keys(newConfig[assetType][origin])) {
          const criteria = newConfig[assetType][origin][field];
          if (criteria.unit === 'perc') {
            const factor = toUI ? 100 : 0.01;
            if (criteria.min !== undefined && criteria.min !== null) {
              criteria.min = Number((criteria.min * factor).toFixed(2));
            }
            if (criteria.max !== undefined && criteria.max !== null) {
              criteria.max = Number((criteria.max * factor).toFixed(2));
            }
          }
        }
      }
    }
    return newConfig;
  }

  ngOnInit() {
    this.analysisService.getCriteria().subscribe(config => {
      // Create a deep copy to edit safely
      console.log(config);
      const transformedConfig = this.transformValues(config, true);
      this.savedConfig = JSON.parse(JSON.stringify(transformedConfig));
      this.resetToDefaults();
    });
  }

  onAssetTypeChange(value: string) {
    this.selectedAssetType = value;
    this.loadFields();
  }

  onOriginChange(value: string) {
    this.selectedOrigin = value;
    this.loadFields();
  }

  loadFields() {
    if (!this.activeConfig) return;

    const criteriaSet = this.activeConfig[this.selectedAssetType]?.[this.selectedOrigin] || {};
    this.fieldsList = Object.keys(criteriaSet).map(key => ({
      key,
      criteria: criteriaSet[key]
    }));
  }

  save() {
    if (!this.activeConfig) return;

    this.saving = true;
    this.saveSuccess = false;

    const payload = this.transformValues(this.activeConfig, false);

    this.analysisService.saveCriteria(payload).subscribe({
      next: (config) => {
        const transformedConfig = this.transformValues(config, true);
        this.savedConfig = JSON.parse(JSON.stringify(transformedConfig));
        this.saving = false;
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  resetToDefaults() {
    if (this.savedConfig) {
      this.activeConfig = JSON.parse(JSON.stringify(this.savedConfig));
      this.loadFields();
    }
  }
}
