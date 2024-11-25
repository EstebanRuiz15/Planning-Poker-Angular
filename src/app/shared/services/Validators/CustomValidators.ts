import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static gameNameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    if (value.length < 5 || value.length > 20) {
      return { length: true };
    }

    if (/[_,.*#/-]/.test(value)) {
      return { specialCharacters: true };
    }

    const numbers = value.match(/\d/g);
    if (numbers && numbers.length > 3) {
      return { tooManyNumbers: true };
    }

    if (/^\d+$/.test(value)) {
      return { onlyNumbers: true };
    }

    return null;
  }
}
