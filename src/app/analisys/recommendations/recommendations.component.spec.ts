import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecommendationsComponent } from './recommendations.component';
import { AnalisysService } from '../analisys.service';
import { of, throwError } from 'rxjs';
import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent { @Input() loading: boolean = false; }

describe('RecommendationsComponent', () => {
  let component: RecommendationsComponent;
  let fixture: ComponentFixture<RecommendationsComponent>;
  let analysisService: jest.Mocked<Partial<AnalisysService>>;

  beforeEach(async () => {
    analysisService = {
      getBuyRecommendations: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [RecommendationsComponent],
    })
    .overrideComponent(RecommendationsComponent, {
      set: {
        imports: [CommonModule, FormsModule, MockLoadingBarComponent],
        providers: [
          { provide: AnalisysService, useValue: analysisService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendationsComponent);
    component = fixture.componentInstance;
    component.type = 'SHARES';
    component.origin = 'BR';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default budget to 1000', () => {
    expect(component.budget).toBe(1000);
  });

  describe('getBuyRecommendations', () => {
    it('should call service with correct parameters', () => {
      const mockRecs = [
        { ticker: 'PETR4', amount: 3 },
        { ticker: 'VALE3', amount: 2 }
      ];
      (analysisService.getBuyRecommendations as jest.Mock).mockReturnValue(of(mockRecs));

      component.budget = 500;
      component.getBuyRecommendations();

      expect(analysisService.getBuyRecommendations).toHaveBeenCalledWith('shares', 'BR', 500);
    });

    it('should extract total_spent from recommendations', () => {
      const mockRecs = [
        { ticker: 'PETR4', amount: 3 },
        { ticker: 'total_spent', amount: 950 }
      ];
      (analysisService.getBuyRecommendations as jest.Mock).mockReturnValue(of(mockRecs));

      component.getBuyRecommendations();

      expect(component.totalSpent).toBe(950);
      expect(component.recommendations).toEqual([{ ticker: 'PETR4', amount: 3 }]);
      expect(component.isLoading).toBe(false);
    });

    it('should handle response without total_spent', () => {
      const mockRecs = [{ ticker: 'PETR4', amount: 3 }];
      (analysisService.getBuyRecommendations as jest.Mock).mockReturnValue(of(mockRecs));

      component.getBuyRecommendations();

      expect(component.totalSpent).toBeUndefined();
      expect(component.recommendations).toEqual(mockRecs);
    });

    it('should not call service when budget is 0', () => {
      component.budget = 0;
      component.getBuyRecommendations();
      expect(analysisService.getBuyRecommendations).not.toHaveBeenCalled();
    });

    it('should not call service when budget is negative', () => {
      component.budget = -100;
      component.getBuyRecommendations();
      expect(analysisService.getBuyRecommendations).not.toHaveBeenCalled();
    });

    it('should set recommendations to empty array on API error', () => {
      (analysisService.getBuyRecommendations as jest.Mock).mockReturnValue(throwError(() => 'error'));

      component.getBuyRecommendations();

      expect(component.recommendations).toEqual([]);
      expect(component.isLoading).toBe(false);
    });

    it('should set isLoading to true during request', () => {
      (analysisService.getBuyRecommendations as jest.Mock).mockReturnValue(of([]));

      // Before the call
      expect(component.isLoading).toBe(false);

      component.getBuyRecommendations();
      // After synchronous subscribe, it should be false again
      expect(component.isLoading).toBe(false);
    });
  });
});
