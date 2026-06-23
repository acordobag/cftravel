import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+506', label: 'Costa Rica', flag: '🇨🇷' },
  { code: '+1',   label: 'USA / Canada', flag: '🇺🇸' },
  { code: '+52',  label: 'Mexico', flag: '🇲🇽' },
  { code: '+54',  label: 'Argentina', flag: '🇦🇷' },
  { code: '+55',  label: 'Brazil', flag: '🇧🇷' },
  { code: '+57',  label: 'Colombia', flag: '🇨🇴' },
  { code: '+58',  label: 'Venezuela', flag: '🇻🇪' },
  { code: '+502', label: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', label: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', label: 'Honduras', flag: '🇭🇳' },
  { code: '+505', label: 'Nicaragua', flag: '🇳🇮' },
  { code: '+507', label: 'Panama', flag: '🇵🇦' },
  { code: '+34',  label: 'Spain', flag: '🇪🇸' },
  { code: '+44',  label: 'UK', flag: '🇬🇧' },
  { code: '+33',  label: 'France', flag: '🇫🇷' },
  { code: '+49',  label: 'Germany', flag: '🇩🇪' },
  { code: '+31',  label: 'Netherlands', flag: '🇳🇱' },
  { code: '+39',  label: 'Italy', flag: '🇮🇹' },
  { code: '+61',  label: 'Australia', flag: '🇦🇺' },
  { code: '+64',  label: 'New Zealand', flag: '🇳🇿' },
];

const DEFAULT_CODE = '+506';

function splitPhone(value: string): { code: string; number: string } {
  if (!value) return { code: DEFAULT_CODE, number: '' };
  const match = COUNTRY_CODES.find(c => value.startsWith(c.code + ' ') || value.startsWith(c.code));
  if (match) {
    const rest = value.slice(match.code.length).replace(/^\s+/, '');
    return { code: match.code, number: rest };
  }
  return { code: DEFAULT_CODE, number: value };
}

@Component({
  selector: 'app-phone-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PhoneFieldComponent), multi: true }],
  template: `
    <div class="phone-field" [class.phone-field-sm]="size === 'sm'">
      <select class="phone-code-select" [(ngModel)]="selectedCode" (ngModelChange)="onCodeChange($event)" [name]="name + '_code'" [disabled]="isDisabled">
        <option *ngFor="let c of countries" [value]="c.code">{{ c.flag }} {{ c.code }}</option>
      </select>
      <input
        class="phone-number-input"
        type="tel"
        [placeholder]="placeholder"
        [(ngModel)]="numberPart"
        (ngModelChange)="onNumberChange($event)"
        [name]="name + '_number'"
        [required]="required"
        [disabled]="isDisabled">
    </div>
  `,
  styles: [`
    .phone-field {
      display: flex;
      gap: 0;
      min-width: 0;
    }
    .phone-code-select {
      border-radius: 8px 0 0 8px !important;
      border-right: none !important;
      flex-shrink: 0;
      min-height: 48px;
      padding: 0 8px;
      width: 108px;
    }
    .phone-number-input {
      border-radius: 0 8px 8px 0 !important;
      flex: 1;
      min-width: 0;
    }
    .phone-field-sm .phone-code-select,
    .phone-field-sm .phone-number-input {
      min-height: 40px;
    }
  `]
})
export class PhoneFieldComponent implements ControlValueAccessor {
  @Input() name = 'phone';
  @Input() placeholder = '8888 8888';
  @Input() required = false;
  @Input() size: 'default' | 'sm' = 'default';

  readonly countries = COUNTRY_CODES;

  selectedCode = DEFAULT_CODE;
  numberPart = '';
  isDisabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    const { code, number } = splitPhone(value || '');
    this.selectedCode = code;
    this.numberPart = number;
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.isDisabled = disabled; }

  onCodeChange(code: string): void {
    this.selectedCode = code;
    this.emit();
  }

  onNumberChange(number: string): void {
    this.numberPart = number;
    this.onTouched();
    this.emit();
  }

  private emit(): void {
    const combined = this.numberPart ? `${this.selectedCode} ${this.numberPart.trim()}` : '';
    this.onChange(combined);
  }
}
