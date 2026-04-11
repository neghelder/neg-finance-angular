import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PieComponent } from './pie.component';

import { Component, Input } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({ selector: 'highcharts-chart', standalone: true, template: '' })
class MockHighchartsChartComponent {
  @Input() Highcharts: any;
  @Input() constructorType: any;
  @Input() options: any;
}

describe('PieComponent', () => {
  let component: PieComponent;
  let fixture: ComponentFixture<PieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieComponent],
    })
    .overrideComponent(PieComponent, {
      remove: { imports: [HighchartsChartModule] },
      add: { imports: [MockHighchartsChartComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PieComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default inputs', () => {
    expect(component.title).toBeUndefined();
    expect(component.subtitle).toBeUndefined();
    expect(component.data).toBeUndefined();
  });
});
