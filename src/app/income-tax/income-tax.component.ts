import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ColDef, RowSelectedEvent } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { LoadingBarComponent } from '../shared/loading-bar/loading-bar.component';
import { IncomeTaxAsset } from './income-tax';
import { IncomeTaxService } from './income-tax.service';
import { assetsCsv, assetText, formatNumber, metadataLabel } from './income-tax-export';

@Component({
  selector: 'app-income-tax',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, GridComponent, LoadingBarComponent],
  templateUrl: './income-tax.component.html',
  styleUrl: './income-tax.component.scss'
})
export class IncomeTaxComponent implements OnInit, OnDestroy {
  year = 2025;
  market = '';
  assetType = '';
  search = '';
  assets: IncomeTaxAsset[] = [];
  filteredAssets: IncomeTaxAsset[] = [];
  selected: IncomeTaxAsset | null = null;
  loading = false;
  error = '';
  feedback = '';
  private request?: Subscription;
  readonly number = formatNumber;
  readonly metadataLabel = metadataLabel;
  readonly columns: ColDef<IncomeTaxAsset>[] = [
    { field: 'ticker', headerName: 'Ativo', pinned: 'left', width: 120 },
    { field: 'name', headerName: 'Nome', width: 220, valueFormatter: p => p.value ?? 'Indisponível' },
    { field: 'market_code', headerName: 'Mercado', width: 110 },
    { field: 'asset_type_code', headerName: 'Classe', width: 110 },
    { field: 'currency_code', headerName: 'Moeda', width: 100 },
    { field: 'current.quantity', headerName: 'Quantidade atual', width: 170, valueFormatter: p => formatNumber(p.value, 20) },
    { field: 'current.average_price', headerName: 'Preço médio atual', width: 180, valueFormatter: p => formatNumber(p.value) },
    { field: 'previous.fiscal_brl', headerName: 'Situação anterior (BRL)', width: 200, valueFormatter: p => formatNumber(p.value, 2) },
    { field: 'current.fiscal_brl', headerName: 'Situação atual (BRL)', width: 190, valueFormatter: p => formatNumber(p.value, 2) },
    { field: 'cnpj', headerName: 'CNPJ', width: 190, valueGetter: p => p.data ? this.cnpj(p.data) : '' },
    { headerName: 'Grupo / código', width: 150, valueGetter: p => p.data ? this.classification(p.data) : '' },
    { headerName: 'Observações', width: 230, valueGetter: p => p.data?.issues.map(issue => issue.message).join(' ') }
  ];

  constructor(private readonly service: IncomeTaxService) {}

  ngOnInit(): void { this.reload(); }
  ngOnDestroy(): void { this.request?.unsubscribe(); }

  get markets(): string[] { return [...new Set(this.assets.map(asset => asset.market_code))].sort(); }
  get assetTypes(): string[] { return [...new Set(this.assets.map(asset => asset.asset_type_code))].sort(); }
  get report(): IncomeTaxAsset | undefined { return this.assets[0]; }

  reload(): void {
    this.request?.unsubscribe();
    this.loading = true;
    this.error = '';
    this.feedback = '';
    this.assets = [];
    this.applyFilters();
    this.request = this.service.getAssets(this.year).subscribe({
      next: assets => { this.assets = assets; this.loading = false; this.applyFilters(); },
      error: () => { this.loading = false; this.error = 'Não foi possível carregar o relatório. Tente novamente.'; }
    });
  }

  applyFilters(): void {
    const query = this.search.trim().toLocaleLowerCase('pt-BR');
    this.filteredAssets = this.assets.filter(asset =>
      (!this.market || asset.market_code === this.market) &&
      (!this.assetType || asset.asset_type_code === this.assetType) &&
      (!query || `${asset.ticker} ${asset.name ?? ''}`.toLocaleLowerCase('pt-BR').includes(query)));
    if (!this.selected || !this.filteredAssets.includes(this.selected)) {
      this.selected = this.filteredAssets[0] ?? null;
    }
  }

  select(event: RowSelectedEvent<IncomeTaxAsset>): void { this.selected = event.data ?? null; }
  cnpj(asset: IncomeTaxAsset): string { return asset.cnpj_applicable ? asset.cnpj ?? 'Indisponível' : 'Não se aplica'; }
  classification(asset: IncomeTaxAsset): string { return asset.group && asset.code ? `${asset.group} / ${asset.code}` : 'Pendente'; }

  async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.feedback = 'Copiado para a área de transferência.';
    } catch {
      this.feedback = 'Não foi possível copiar. Selecione o texto exibido e copie manualmente.';
    }
  }

  copyRow(asset: IncomeTaxAsset): Promise<void> { return this.copy(assetText(asset)); }

  exportCsv(): void {
    const url = URL.createObjectURL(new Blob([assetsCsv(this.filteredAssets)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `imposto-de-renda-${this.year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.feedback = 'CSV exportado com os ativos filtrados.';
  }
}
