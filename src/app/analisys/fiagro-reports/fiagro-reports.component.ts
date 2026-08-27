import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalisysService } from '../analisys.service';
import { FiagroReportsResponse, FiagroReportResult } from '../models/fiagro-report';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

@Component({
  selector: 'app-fiagro-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingBarComponent],
  templateUrl: './fiagro-reports.component.html',
  styleUrl: './fiagro-reports.component.scss'
})
export class FiagroReportsComponent {

  isLoading = false;
  forceRefresh = false;
  response: FiagroReportsResponse | null = null;
  errorMessage: string | null = null;

  constructor(private analysisService: AnalisysService) {}

  fetchReports(): void {
    this.isLoading = true;
    this.response = null;
    this.errorMessage = null;

    this.analysisService.getFiagroReports(this.forceRefresh).subscribe({
      next: (data) => {
        this.response = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = typeof err === 'string' ? err : 'Erro ao carregar relatórios. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  getRecommendationClass(recomendacao: string | undefined): string {
    switch (recomendacao) {
      case 'COMPRAR': return 'badge-buy';
      case 'NEUTRO': return 'badge-neutral';
      case 'EVITAR': return 'badge-avoid';
      default: return 'badge-unknown';
    }
  }

  getRiskClass(nivel: string | undefined): string {
    switch (nivel) {
      case 'BAIXO': return 'risk-low';
      case 'MODERADO': return 'risk-moderate';
      case 'ELEVADO': return 'risk-high';
      default: return '';
    }
  }

  hasError(result: FiagroReportResult): boolean {
    return !!result.ai_analysis?.error;
  }
}
