import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalisysService } from '../analisys.service';
import { Recommendation } from './recommendation';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingBarComponent
  ],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss'
})
export class RecommendationsComponent implements OnInit {

  budget = 1000;
  isLoading = false;
  
  recommendations: Recommendation[] | undefined = undefined;
  totalSpent: number | undefined = undefined;

  @Input() origin: string;
  @Input() type: string;
  
  constructor(private analysisService: AnalisysService) {}
  
  ngOnInit(): void {
  }

  getBuyRecommendations() {
    if (!this.budget || this.budget <= 0) return;

    this.isLoading = true;
    this.recommendations = undefined;
    this.totalSpent = undefined;
    
    this.analysisService.getBuyRecommendations(this.type.toLowerCase(), this.origin.toUpperCase(), this.budget).subscribe({
      next: (values) => {
        // Extract the total_spent pseudo-recommendation
        const totalSpentRec = values.find(r => r.ticker === 'total_spent');
        if (totalSpentRec) {
          this.totalSpent = totalSpentRec.amount;
          this.recommendations = values.filter(r => r.ticker !== 'total_spent');
        } else {
          this.recommendations = values;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.recommendations = [];
      }
    });
  }

}
