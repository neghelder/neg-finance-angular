import { Component, Input, OnChanges, OnInit, SimpleChanges, inject, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_exporting from 'highcharts/modules/exporting';
import { ThemeService } from '../../../layout/theme.service';

@Component({
  selector: 'app-widget-pie',
  standalone: true,
  imports: [
    HighchartsChartModule,
    MatIconModule
  ],
  templateUrl: './pie.component.html',
  styleUrl: './pie.component.scss'
})
export class PieComponent implements OnInit {

  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;
  @Input() data: any[] | undefined;

  Highcharts = Highcharts;
  chartOptions = {};

  themeService = inject(ThemeService);

  constructor() {
    effect(() => {
      const theme = this.themeService.activeTheme();
      this.updateChartOptions(theme);
    });
  }

  ngOnInit() {
    this.updateChartOptions(this.themeService.activeTheme());
    
    // HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  private updateChartOptions(theme: 'light' | 'dark'): void {
    const textColor = theme === 'dark' ? '#f0f2f5' : '#1e293b';
    
    this.chartOptions = {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: this.title,
        style: { color: textColor }
      },
      subtitle: {
        text: this.subtitle,
        style: { color: textColor }
      },
      plotOptions: {
        pie: {
          borderWidth: theme === 'dark' ? 0 : 1
        },
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            format: '<span style="font-size: 1.2em; color: ' + textColor + '"><b>{point.name}</b></span><br>' +
                '<span style="opacity: 0.6; color: ' + textColor + '">{point.percentage:.1f} %</span>',
            style: { color: textColor, textOutline: 'none' }
          }
        }
      },
      series: [
        {
          name: 'Quantidade',
          colorByPoint: true,
          data: this.data  
        }
      ]
    };
  }
}
