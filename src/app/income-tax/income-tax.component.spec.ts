import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IncomeTaxComponent } from './income-tax.component';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { assetFixture } from './income-tax.fixture';
import { IncomeTaxAsset } from './income-tax';
import { routes } from '../app.routes';

@Component({ selector: 'app-widget-grid', standalone: true, template: '' })
class TestGridComponent {
  @Input() data: IncomeTaxAsset[] = [];
  @Input() colDefs: unknown[] = [];
  @Output() rowSelected = new EventEmitter();
}

describe('IncomeTaxComponent HTTP/template integration', () => {
  let fixture: ComponentFixture<IncomeTaxComponent>;
  let component: IncomeTaxComponent;
  let http: HttpTestingController;
  const url = (year = 2025) => `http://localhost:8000/income-tax/assets?calendar_year=${year}`;
  const text = () => fixture.nativeElement.textContent as string;
  const flush = (rows: IncomeTaxAsset[]) => { http.expectOne(url(component.year)).flush(rows); fixture.detectChanges(); };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [IncomeTaxComponent, HttpClientTestingModule, NoopAnimationsModule] })
      .overrideComponent(IncomeTaxComponent, { remove: { imports: [GridComponent] }, add: { imports: [TestGridComponent] } })
      .compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(IncomeTaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => { http.verify(); fixture.destroy(); });

  it('keeps themed Material actions disabled until export data is available', () => {
    const exportButton = fixture.nativeElement.querySelector('.page-heading button') as HTMLButtonElement;
    expect(exportButton.classList.contains('mat-mdc-outlined-button')).toBe(true);
    expect(exportButton.disabled).toBe(true);
    flush([assetFixture()]);
    expect(exportButton.disabled).toBe(false);
    const copyButton = fixture.nativeElement.querySelector('[aria-label="Copiar CNPJ"]') as HTMLButtonElement;
    expect(copyButton.classList.contains('mat-mdc-button')).toBe(true);
    expect(copyButton.disabled).toBe(false);
    component.search = 'no results'; component.applyFilters(); fixture.detectChanges();
    expect(exportButton.disabled).toBe(true);
  });

  it('loads 2025, renders exact dates, fractional values and all copyable detail fields', () => {
    expect(text()).toContain('Carregando relatório');
    flush([assetFixture()]);
    expect(text()).toContain('31/12/2024'); expect(text()).toContain('31/12/2025');
    expect(text()).toContain('exercício 2026');
    expect(text()).toContain('1,125'); expect(text()).toContain('12,12345678');
    expect(text()).toContain('13,64'); expect(text()).toContain('Indisponível');
    expect(text()).toContain('00.000.000/0001-00');
    expect(text()).toContain('03 / 01'); expect(text()).toContain('Sem posição registrada');
    expect(text()).toContain('pode diferir da razão social');
    expect(fixture.nativeElement.querySelector('[data-testid=asset-description]').textContent).toBe('1,125 ações de TEST3.');
    expect(fixture.debugElement.query(By.directive(TestGridComponent)).componentInstance.data).toEqual(component.assets);
  });

  it('changes year through the template and labels the actual preview cutoff', async () => {
    flush([assetFixture()]);
    const year = fixture.nativeElement.querySelector('#income-tax-year') as HTMLSelectElement;
    year.value = year.options[1].value; year.dispatchEvent(new Event('change')); fixture.detectChanges();
    flush([assetFixture({ calendar_year: 2026, filing_year: 2027, previous_date: '31/12/2025', current_date: '16/11/2026', is_preview: true })]);
    expect(component.year).toBe(2026);
    expect(text()).toContain('Prévia até 16/11/2026');
    expect(text()).toContain('exercício 2027');
  });

  it('filters market, class and ticker/name and selects the first matching detail', () => {
    flush([assetFixture(), assetFixture({ ticker: 'US', name: 'Exterior', market_code: 'USA', asset_type_code: 'ETF' })]);
    const search = fixture.nativeElement.querySelector('#income-tax-search') as HTMLInputElement;
    search.value = 'exterior'; search.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(component.filteredAssets.map(asset => asset.ticker)).toEqual(['US']);
    expect(text()).toContain('US'); expect(component.selected?.ticker).toBe('US');
    component.market = 'BR'; component.applyFilters(); fixture.detectChanges();
    expect(text()).toContain('Nenhum ativo corresponde aos filtros');
    component.search = ''; component.market = ''; component.assetType = 'SHARE'; component.applyFilters();
    expect(component.filteredAssets.map(asset => asset.ticker)).toEqual(['TEST3']);
  });

  it('keeps closed quantity/cost zero distinct from unavailable average and shows foreign native values', () => {
    const asset = assetFixture({ market_code: 'USA', currency_code: 'USD', cnpj_applicable: false, group: null, code: null,
      current: { quantity: 0, average_price: null, native_cost: 0, fiscal_brl: null, source_date: '10/03/2025', source_id: 0 },
      issues: [{ code: 'CLOSED_POSITION', message: 'Posição encerrada.', reference_date: '31/12/2025' }, { code: 'FX_PENDING', message: 'Conversão fiscal pendente.', reference_date: null }]
    });
    flush([asset]);
    expect(text()).toContain('Posição encerrada'); expect(text()).toContain('0,00');
    expect(text()).toContain('Preço médio (USD)'); expect(text()).toContain('Custo registrado (USD)');
    expect(text()).toContain('Não se aplica'); expect(text()).toContain('Conversão fiscal pendente');
    expect(text()).toContain('Pendente');
    expect(fixture.nativeElement.querySelector('[aria-label="Copiar quantidade atual"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Copiar preço médio atual"]')).toBeNull();
  });

  it('shows an error and can retry without retaining stale assets, then shows the empty state', () => {
    http.expectOne(url()).flush({}, { status: 503, statusText: 'Unavailable' }); fixture.detectChanges();
    expect(text()).toContain('Não foi possível carregar');
    const retry = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(button => button.textContent?.includes('Tentar novamente'))!;
    retry.click(); fixture.detectChanges(); flush([]);
    expect(text()).toContain('Nenhum ativo com posição'); expect(component.error).toBe('');
    expect(component.selected).toBeNull();
  });

  it('copies individual fields, description and labeled row with feedback and a selectable fallback', async () => {
    flush([assetFixture()]);
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    fixture.nativeElement.querySelector('[aria-label="Copiar CNPJ"]').click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(writeText).toHaveBeenLastCalledWith('00.000.000/0001-00');
    expect(text()).toContain('Copiado para a área');
    await component.copyRow(component.selected!);
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('Situação Atual (BRL): 13,64'));
    writeText.mockRejectedValue(new Error('denied'));
    await component.copy(component.selected!.description); fixture.detectChanges();
    expect(text()).toContain('copie manualmente');
    expect(fixture.nativeElement.querySelector('[data-testid=asset-description]').textContent).toContain('1,125 ações');
  });

  it('exports only filtered assets with BOM and revokes the download URL', () => {
    flush([assetFixture(), assetFixture({ ticker: 'OTHER' })]);
    component.search = 'TEST3'; component.applyFilters();
    const createObjectURL = jest.fn().mockReturnValue('blob:test');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    component.exportCsv();
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test'); expect(click).toHaveBeenCalled();
    expect(component.feedback).toContain('ativos filtrados');
    click.mockRestore();
  });

  it('registers a lazy route and handles selection through the shared grid output', () => {
    const rows = [assetFixture(), assetFixture({ ticker: 'SECOND' })]; flush(rows);
    fixture.debugElement.query(By.directive(TestGridComponent)).componentInstance.rowSelected.emit({ data: rows[1] });
    fixture.detectChanges(); expect(component.selected?.ticker).toBe('SECOND');
    expect(routes[0].children?.find(route => route.path === 'income-tax')?.loadComponent).toBeDefined();
  });
});
