import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AssetCatalogService } from '../asset-catalog.service';
import { AssetCategory, AssetMarket, AssetType } from '../asset-catalog';

@Component({
  selector: 'app-asset-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './asset-categories.component.html',
  styleUrl: './asset-categories.component.scss'
})
export class AssetCategoriesComponent implements OnInit {
  markets: AssetMarket[] = [];
  types: AssetType[] = [];
  categories: AssetCategory[] = [];
  error = '';

  market = { code: '', label: '', currency_code: '' };
  category = { market_code: '', asset_type_code: '', label: '' };

  constructor(private catalog: AssetCatalogService) {}

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.catalog.getMarkets().subscribe({ next: data => this.markets = data, error: error => this.error = error.message });
    this.catalog.getTypes().subscribe({ next: data => this.types = data, error: error => this.error = error.message });
    this.catalog.getCategories().subscribe({ next: data => this.categories = data, error: error => this.error = error.message });
  }

  createMarket(): void {
    this.catalog.createMarket(this.market).subscribe({
      next: () => { this.market = { code: '', label: '', currency_code: '' }; this.reload(); },
      error: error => this.error = error.error?.detail || error.message
    });
  }

  createCategory(): void {
    this.catalog.createCategory(this.category).subscribe({
      next: () => { this.category = { market_code: '', asset_type_code: '', label: '' }; this.reload(); },
      error: error => this.error = error.error?.detail || error.message
    });
  }

  archive(category: AssetCategory): void {
    this.catalog.archiveCategory(category.code).subscribe({ next: () => this.reload(), error: error => this.error = error.error?.detail || error.message });
  }
}
