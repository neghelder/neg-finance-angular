import { TestBed } from '@angular/core/testing';
import { RenameTickerComponent } from './rename-ticker.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('RenameTickerComponent', () => {
  let component: RenameTickerComponent;
  let dialogRef: jest.Mocked<MatDialogRef<RenameTickerComponent>>;

  const mockDialogData = {
    tickerNames: ['PETR4', 'VALE3', 'ITUB4'],
    selectedTicker: 'PETR4'
  };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [RenameTickerComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(RenameTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls from dialog data', () => {
    expect(component.oldTickerControl.value).toBe('PETR4');
    expect(component.newTickerControl.value).toBe('');
  });

  describe('onSave', () => {
    it('should close dialog with form values when form is valid', () => {
      component.newTickerControl.setValue('PETR3');
      component.onSave();
      expect(dialogRef.close).toHaveBeenCalledWith({
        oldTicker: 'PETR4',
        newTicker: 'PETR3'
      });
    });

    it('should convert new ticker to uppercase', () => {
      component.newTickerControl.setValue('vale3');
      component.onSave();
      expect(dialogRef.close).toHaveBeenCalledWith({
        oldTicker: 'PETR4',
        newTicker: 'VALE3'
      });
    });

    it('should not close dialog when form is invalid', () => {
      component.newTickerControl.setValue('');
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
});
