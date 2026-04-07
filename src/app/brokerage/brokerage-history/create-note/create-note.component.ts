import {Component, Inject, OnInit, Injectable} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, Validators, ReactiveFormsModule, FormGroup, FormBuilder} from '@angular/forms';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DateAdapter, NativeDateAdapter, MatOptionModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DialogData } from '../dialogData';
import { map, Observable, startWith, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const parts = value.split('/');
      if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-create-note',
  standalone: true,
  imports: [
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatIconModule,
    AsyncPipe
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './create-note.component.html',
  styleUrl: './create-note.component.scss'
})

export class CreateNoteComponent implements OnInit {
  filteredTickers: Observable<string[]>;
  form: FormGroup;
  dateControl = new FormControl<Date | string>(this.getInitialDate(), [Validators.required]);
  tickerControl = new FormControl(this.data?.note.ticker, [Validators.required]);
  opControl = new FormControl(this.data?.note.op, [Validators.required]);
  priceControl = new FormControl(this.data?.note.price, [Validators.required]);
  quantityControl = new FormControl(this.data?.note.qtd, [Validators.required]);
  feesControl = new FormControl(this.data?.note.total_rat, [Validators.required]);

  private getInitialDate(): Date {
    const d: any = this.data?.note.date;
    if (d) {
      if (d instanceof Date) return d;
      if (typeof d === 'string') {
        const parts = d.split('/');
        if (parts.length === 3) {
          return new Date(+parts[2], +parts[1] - 1, +parts[0]);
        }
      }
    }
    return new Date();
  }

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

    return control.hasError('email') ? 'Invalid format' : '';
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      const result = { ...this.form.value };
      if (result.dateControl instanceof Date) {
        const day = result.dateControl.getDate().toString().padStart(2, '0');
        const month = (result.dateControl.getMonth() + 1).toString().padStart(2, '0');
        const year = result.dateControl.getFullYear();
        result.dateControl = `${day}/${month}/${year}`;
      }
      this.dialogRef.close(result);
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
