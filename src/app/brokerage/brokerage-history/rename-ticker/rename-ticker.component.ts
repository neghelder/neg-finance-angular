import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface RenameTickerDialogData {
  tickerNames: string[];
  selectedTicker?: string;
}

@Component({
  selector: 'app-rename-ticker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './rename-ticker.component.html',
  styleUrl: './rename-ticker.component.scss'
})
export class RenameTickerComponent implements OnInit {
  form: FormGroup;
  oldTickerControl = new FormControl(this.data?.selectedTicker || '', [Validators.required]);
  newTickerControl = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RenameTickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RenameTickerDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      oldTickerControl: this.oldTickerControl,
      newTickerControl: this.newTickerControl
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close({
        oldTicker: this.oldTickerControl.value,
        newTicker: this.newTickerControl.value?.toUpperCase()
      });
    }
  }
}
