import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiagroReportsComponent } from './fiagro-reports.component';

describe('FiagroReportsComponent', () => {
  let fixture: ComponentFixture<FiagroReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FiagroReportsComponent] }).compileComponents();
    fixture = TestBed.createComponent(FiagroReportsComponent);
    fixture.detectChanges();
  });

  it('is a passive compatibility shell that delegates to scheduled reports', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Relatórios agendados');
    expect(fixture.nativeElement.textContent).not.toContain('Forçar atualização');
    expect(fixture.nativeElement.textContent).not.toContain('Analisar Relatórios');
  });
});
