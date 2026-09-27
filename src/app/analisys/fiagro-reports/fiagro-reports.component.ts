import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 * Deprecated compatibility shell. ScheduledReportsComponent is the only
 * report UI that reads report assessments and never starts an analysis.
 */
@Component({
  selector: 'app-fiagro-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fiagro-reports.component.html',
  styleUrl: './fiagro-reports.component.scss'
})
export class FiagroReportsComponent {}
