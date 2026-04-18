import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AssetTypeOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-asset-type-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asset-type-selector.component.html',
  styleUrl: './asset-type-selector.component.scss'
})
export class AssetTypeSelectorComponent {
  @Input() label: string = 'Asset Type';
  @Input() options: AssetTypeOption[] = [];
  @Input() selectedValue: string = '';
  @Output() selectionChange = new EventEmitter<string>();

  onSelectionChange(value: string): void {
    this.selectionChange.emit(value);
  }
}
