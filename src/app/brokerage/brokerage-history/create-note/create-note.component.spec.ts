import { TestBed } from '@angular/core/testing';
import { CreateNoteComponent, CustomDateAdapter, CUSTOM_DATE_FORMATS } from './create-note.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

describe('CustomDateAdapter', () => {
  let adapter: CustomDateAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CustomDateAdapter,
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
      ]
    });
    adapter = TestBed.inject(CustomDateAdapter);
  });

  describe('parse', () => {
    it('should parse valid DD/MM/YYYY string', () => {
      const result = adapter.parse('25/12/2024');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getDate()).toBe(25);
      expect(result!.getMonth()).toBe(11); // December = 11
      expect(result!.getFullYear()).toBe(2024);
    });

    it('should parse single-digit day and month', () => {
      const result = adapter.parse('5/3/2024');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getDate()).toBe(5);
      expect(result!.getMonth()).toBe(2); // March = 2
      expect(result!.getFullYear()).toBe(2024);
    });

    it('should delegate to parent for non-DD/MM/YYYY input', () => {
      const result = adapter.parse('2024-12-25');
      // NativeDateAdapter will attempt to parse ISO format
      expect(result).toBeInstanceOf(Date);
    });

    it('should delegate to parent for input without slashes', () => {
      const result = adapter.parse('hello');
      // NativeDateAdapter returns null for unparseable strings
      // The result depends on NativeDateAdapter behavior
      expect(result === null || result instanceof Date).toBeTruthy();
    });
  });

  describe('format', () => {
    it('should format date as DD/MM/YYYY', () => {
      const date = new Date(2024, 11, 25); // December 25, 2024
      const result = adapter.format(date, 'DD/MM/YYYY');
      expect(result).toBe('25/12/2024');
    });

    it('should zero-pad day and month', () => {
      const date = new Date(2024, 2, 5); // March 5, 2024
      const result = adapter.format(date, 'DD/MM/YYYY');
      expect(result).toBe('05/03/2024');
    });

    it('should delegate to parent for non-DD/MM/YYYY format', () => {
      const date = new Date(2024, 11, 25);
      const result = adapter.format(date, 'other-format');
      // Should return something from NativeDateAdapter
      expect(typeof result).toBe('string');
    });
  });
});

describe('CreateNoteComponent', () => {
  let component: CreateNoteComponent;
  let dialogRef: jest.Mocked<MatDialogRef<CreateNoteComponent>>;

  const mockDialogData = {
    note: {
      ticker: 'PETR4',
      date: '25/12/2024',
      op: 'C',
      price: 35.5,
      qtd: 100,
      total_rat: 0.5
    },
    tickerNames: ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [CreateNoteComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CreateNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls from dialog data', () => {
    expect(component.tickerControl.value).toBe('PETR4');
    expect(component.opControl.value).toBe('C');
    expect(component.priceControl.value).toBe(35.5);
    expect(component.quantityControl.value).toBe(100);
    expect(component.feesControl.value).toBe(0.5);
  });

  it('should initialize dateControl with parsed Date from DD/MM/YYYY string', () => {
    const dateValue = component.dateControl.value;
    expect(dateValue).toBeInstanceOf(Date);
    if (dateValue instanceof Date) {
      expect(dateValue.getDate()).toBe(25);
      expect(dateValue.getMonth()).toBe(11);
      expect(dateValue.getFullYear()).toBe(2024);
    }
  });

  describe('onSave', () => {
    it('should close dialog with form values when form is valid', () => {
      component.onSave();
      expect(dialogRef.close).toHaveBeenCalled();
      const result = (dialogRef.close as jest.Mock).mock.calls[0][0];
      expect(result.tickerControl).toBe('PETR4');
      expect(result.opControl).toBe('C');
    });

    it('should format Date as DD/MM/YYYY string on save', () => {
      component.dateControl.setValue(new Date(2024, 11, 25));
      component.onSave();
      const result = (dialogRef.close as jest.Mock).mock.calls[0][0];
      expect(result.dateControl).toBe('25/12/2024');
    });

    it('should not close dialog when form is invalid', () => {
      component.tickerControl.setValue('');
      component.onSave();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('getErrorMessage', () => {
    it('should return required message for required error', () => {
      const control = new FormControl('', { validators: [() => ({ required: true })] });
      control.markAsTouched();
      control.setErrors({ required: true });
      expect(component.getErrorMessage(control)).toBe('You must enter a value');
    });

    it('should return email error message for email error', () => {
      const control = new FormControl('');
      control.setErrors({ email: true });
      expect(component.getErrorMessage(control)).toBe('Invalid format');
    });
  });

  describe('ticker filtering', () => {
    it('should filter tickers case-insensitively', () => {
      // The _filter method is private, but we can test via the filteredTickers observable
      component.tickerControl.setValue('petr');
      component.filteredTickers.subscribe(result => {
        expect(result).toEqual(['PETR4']);
      });
    });

    it('should return all tickers for empty input', () => {
      component.tickerControl.setValue('');
      component.filteredTickers.subscribe(result => {
        expect(result).toEqual(['PETR4', 'VALE3', 'ITUB4', 'BBDC4']);
      });
    });
  });
});
