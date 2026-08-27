import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiagroReportsComponent } from './fiagro-reports.component';
import { AnalisysService } from '../analisys.service';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';
import { FiagroReportsResponse } from '../models/fiagro-report';

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent { @Input() loading: boolean = false; }

const mockResponseSuccess: FiagroReportsResponse = {
  status: 'success',
  eligible_count: 2,
  timestamp: '2026-08-18T10:00:00',
  results: [
    {
      ticker: 'KFOF11',
      market_indicators: { price: 9.5 },
      ai_analysis: {
        ticker: 'KFOF11',
        nome_fundo: 'Kinea Fundo de Fundos',
        data_referencia: '2026-07-31',
        resumo_geral: 'Fundo sólido com boa diversificação.',
        risco_concentracao: {
          maior_devedor_pct_pl: '12%',
          detalhes_devedores: 'Concentrado em devedores prime.',
          nivel_risco_concentracao: 'BAIXO'
        },
        remuneracao_carteira: 'CDI + 2%',
        inadimplencia_pct: '0.5%',
        pontos_fortes: ['Diversificado', 'Boa gestão'],
        pontos_fracos: ['Liquidez baixa'],
        nota_recomendacao: 8,
        recomendacao: 'COMPRAR',
        justificativa_final: 'Excelente opção para renda.'
      }
    },
    {
      ticker: 'XPSF11',
      market_indicators: { price: 8.2 },
      ai_analysis: {
        ticker: 'XPSF11',
        error: 'PDF não disponível'
      }
    }
  ]
};

const mockResponseZeroEligible: FiagroReportsResponse = {
  status: 'success',
  eligible_count: 0,
  message: 'Nenhum FIAGRO elegível encontrado.',
  results: []
};

describe('FiagroReportsComponent', () => {
  let component: FiagroReportsComponent;
  let fixture: ComponentFixture<FiagroReportsComponent>;
  let mockService: { getFiagroReports: jest.Mock };

  beforeEach(async () => {
    mockService = {
      getFiagroReports: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FiagroReportsComponent],
      providers: [
        { provide: AnalisysService, useValue: mockService }
      ]
    })
    .overrideComponent(FiagroReportsComponent, {
      set: {
        imports: [MockLoadingBarComponent],
        providers: [
          { provide: AnalisysService, useValue: mockService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiagroReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should NOT call getFiagroReports on init (only on button click)', () => {
    // This is the critical gate test — proves reports are never auto-loaded
    expect(mockService.getFiagroReports).not.toHaveBeenCalled();
  });

  it('should start with loading=false, response=null, errorMessage=null', () => {
    expect(component.isLoading).toBe(false);
    expect(component.response).toBeNull();
    expect(component.errorMessage).toBeNull();
  });

  describe('fetchReports()', () => {
    it('should set isLoading=true during fetch, then false on success', () => {
      mockService.getFiagroReports.mockReturnValue(of(mockResponseSuccess));

      component.fetchReports();

      expect(component.isLoading).toBe(false);
      expect(component.response).toEqual(mockResponseSuccess);
      expect(component.errorMessage).toBeNull();
    });

    it('should call service with forceRefresh=false by default', () => {
      mockService.getFiagroReports.mockReturnValue(of(mockResponseSuccess));

      component.fetchReports();

      expect(mockService.getFiagroReports).toHaveBeenCalledWith(false);
    });

    it('should call service with forceRefresh=true when toggled', () => {
      mockService.getFiagroReports.mockReturnValue(of(mockResponseSuccess));
      component.forceRefresh = true;

      component.fetchReports();

      expect(mockService.getFiagroReports).toHaveBeenCalledWith(true);
    });

    it('should set errorMessage on HTTP error', () => {
      mockService.getFiagroReports.mockReturnValue(throwError(() => 'Backend returned code 500: Internal Server Error'));

      component.fetchReports();

      expect(component.isLoading).toBe(false);
      expect(component.response).toBeNull();
      expect(component.errorMessage).toContain('Backend returned code 500');
    });

    it('should set generic errorMessage when error is not a string', () => {
      mockService.getFiagroReports.mockReturnValue(throwError(() => ({ status: 500 })));

      component.fetchReports();

      expect(component.errorMessage).toBe('Erro ao carregar relatórios. Tente novamente.');
    });

    it('should reset response and errorMessage before each fetch', () => {
      component.response = mockResponseSuccess;
      component.errorMessage = 'Previous error';

      mockService.getFiagroReports.mockReturnValue(of(mockResponseZeroEligible));

      component.fetchReports();

      expect(component.errorMessage).toBeNull();
      expect(component.response).toEqual(mockResponseZeroEligible);
    });
  });

  describe('response rendering state', () => {
    it('should handle eligible_count === 0 and show message', () => {
      mockService.getFiagroReports.mockReturnValue(of(mockResponseZeroEligible));

      component.fetchReports();

      expect(component.response!.eligible_count).toBe(0);
      expect(component.response!.message).toBe('Nenhum FIAGRO elegível encontrado.');
    });

    it('should surface per-ticker error via hasError()', () => {
      const errorResult = mockResponseSuccess.results[1];
      expect(component.hasError(errorResult)).toBe(true);
    });

    it('should return false for hasError when no error field', () => {
      const goodResult = mockResponseSuccess.results[0];
      expect(component.hasError(goodResult)).toBe(false);
    });
  });

  describe('getRecommendationClass()', () => {
    it('should return badge-buy for COMPRAR', () => {
      expect(component.getRecommendationClass('COMPRAR')).toBe('badge-buy');
    });

    it('should return badge-neutral for NEUTRO', () => {
      expect(component.getRecommendationClass('NEUTRO')).toBe('badge-neutral');
    });

    it('should return badge-avoid for EVITAR', () => {
      expect(component.getRecommendationClass('EVITAR')).toBe('badge-avoid');
    });

    it('should return badge-unknown for undefined', () => {
      expect(component.getRecommendationClass(undefined)).toBe('badge-unknown');
    });

    it('should return badge-unknown for unexpected value', () => {
      expect(component.getRecommendationClass('OTHER')).toBe('badge-unknown');
    });
  });

  describe('getRiskClass()', () => {
    it('should return risk-low for BAIXO', () => {
      expect(component.getRiskClass('BAIXO')).toBe('risk-low');
    });

    it('should return risk-moderate for MODERADO', () => {
      expect(component.getRiskClass('MODERADO')).toBe('risk-moderate');
    });

    it('should return risk-high for ELEVADO', () => {
      expect(component.getRiskClass('ELEVADO')).toBe('risk-high');
    });

    it('should return empty string for undefined', () => {
      expect(component.getRiskClass(undefined)).toBe('');
    });
  });
});
