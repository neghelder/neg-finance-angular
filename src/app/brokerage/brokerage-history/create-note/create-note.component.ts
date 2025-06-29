import {Component, Inject, OnInit} from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormGroup, FormBuilder} from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NativeDateAdapter, MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DialogData } from '../dialogData';
import { map, Observable, startWith, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    AsyncPipe
  ],
  providers: [
    NativeDateAdapter,
  ],
  templateUrl: './create-note.component.html',
  styleUrl: './create-note.component.scss'
})

export class CreateNoteComponent implements OnInit {
  filteredTickers: Observable<string[]>;
  form: FormGroup;
  dateControl = new FormControl(this.data?.note.date || new Date().toLocaleDateString('pt-BR'), [Validators.required, Validators.pattern(/^\d{2}(\/|-)\d{2}(\/|-)\d{4}$/)]);
  tickerControl = new FormControl(this.data?.note.ticker, [Validators.required]);
  opControl = new FormControl(this.data?.note.op, [Validators.required]);
  priceControl = new FormControl(this.data?.note.price, [Validators.required]);
  quantityControl = new FormControl(this.data?.note.qtd, [Validators.required]);
  feesControl = new FormControl(this.data?.note.total_rat, [Validators.required]);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

  ngOnInit(): void {
    this.filteredTickers = this.tickerControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.form = this.fb.group({
      dateControl: this.dateControl,
      tickerControl : this.tickerControl,
      opControl : this.opControl,
      priceControl : this.priceControl,
      quantityControl : this.quantityControl,
      feesControl : this.feesControl,
    })
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.data?.tickerNames?.filter(option => option.toLowerCase().includes(filterValue));
  }

  getErrorMessage(control: FormControl) {
    if (control.hasError('required')) {
      return 'You must enter a value';
    }

    return control.hasError('email') ? 'Not a valid email' : '';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if(this.form.valid) {
      this.dialogRef.close(this.form.value);
    }    
  }
}

// import {Component} from '@angular/core';
// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatInputModule} from '@angular/material/input';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import {MatNativeDateModule, NativeDateAdapter} from '@angular/material/core';

// /** @title Basic datepicker */
// @Component({
//   templateUrl: './create-note.component.html',
//   standalone: true,
//   providers: [NativeDateAdapter],
//   imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
// })
// export class CreateNoteComponent {}
