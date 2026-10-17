import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetCategory, AssetMarket, AssetType } from './asset-catalog';

@Injectable({ providedIn: 'root' })
export class AssetCatalogService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getMarkets(includeArchived = false): Observable<AssetMarket[]> {
    return this.http.get<AssetMarket[]>(`${this.baseUrl}/asset-catalog/markets?include_archived=${includeArchived}`);
  }

  createMarket(input: Pick<AssetMarket, 'code' | 'label' | 'currency_code'>): Observable<AssetMarket> {
    return this.http.post<AssetMarket>(`${this.baseUrl}/asset-catalog/markets`, input);
  }

  getTypes(): Observable<AssetType[]> {
    return this.http.get<AssetType[]>(`${this.baseUrl}/asset-catalog/types`);
  }

  getCategories(capability?: string, includeArchived = false): Observable<AssetCategory[]> {
    const params = new URLSearchParams({ include_archived: String(includeArchived) });
    if (capability) params.set('capability', capability);
    return this.http.get<AssetCategory[]>(`${this.baseUrl}/asset-catalog/categories?${params.toString()}`);
  }

  createCategory(input: { market_code: string; asset_type_code: string; label: string }): Observable<AssetCategory> {
    return this.http.post<AssetCategory>(`${this.baseUrl}/asset-catalog/categories`, input);
  }

  archiveCategory(code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/asset-catalog/categories/${code}`);
  }

  getBrokerageCategories(includeArchived = false): Observable<AssetCategory[]> {
    return this.http.get<AssetCategory[]>(`${this.baseUrl}/brokerage/categories?include_archived=${includeArchived}`);
  }

  enableBrokerageCategory(code: string): Observable<AssetCategory> {
    return this.http.put<AssetCategory>(`${this.baseUrl}/brokerage/categories/${code}`, {});
  }

  archiveBrokerageCategory(code: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brokerage/categories/${code}`);
  }
}
