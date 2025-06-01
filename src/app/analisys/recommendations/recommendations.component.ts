import { Component, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { AnalisysService } from '../analisys.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Recommendation } from './recommendation';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './recommendations.component.html',
  styleUrl: './recommendations.component.scss'
})
export class RecommendationsComponent implements OnInit {

  budget = 1000;
  
  recommendations: Recommendation[];

  @Input() origin: string;
  @Input() type: string;
  
  constructor(private analysisService: AnalisysService) {}
  
  ngOnInit(): void {
  }

  getBuyRecommendations() {
    this.analysisService.getBuyRecommendations(this.type.toLowerCase(), this.origin.toUpperCase(), this.budget).subscribe( 
      values => this.recommendations = values);
  }

}
