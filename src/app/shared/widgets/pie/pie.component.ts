import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import HC_exporting from 'highcharts/modules/exporting';

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

  constructor() { }

  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: this.title
      },
      // tooltip: {
      //   valueSuffix: '%'
      // },
      subtitle: {
        text: this.subtitle
      },
      plotOptions: {
        series: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            // enabled: true,
            format: '<span style="font-size: 1.2em"><b>{point.name}</b></span><br>' +
                '<span style="opacity: 0.6">{point.percentage:.1f} %</span>',
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
    
    // HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }
}
