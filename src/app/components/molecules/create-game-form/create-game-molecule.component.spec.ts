import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CreateGameFormComponent } from './create-game-molecule.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-atom',
  template: `
    <div>
      <label>{{ title }}</label>
      <input
        [value]="value"
        (input)="onInputChange($event)"
        [placeholder]="placeholder"
      >
      <div *ngIf="error" class="error-message">{{ errorMessage }}</div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockInputAtomComponent),
      multi: true
    }
  ]
})
class MockInputAtomComponent implements ControlValueAccessor {
  @Input() title: string = '';
  @Input() placeholder: string = '';
  @Input() error: boolean = false;
  @Input() errorMessage: string = '';

  value: string = '';

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}

describe('CreateGameFormComponent', () => {
  let component: CreateGameFormComponent;
  let fixture: ComponentFixture<CreateGameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CreateGameFormComponent,
        ButtonComponent,
        MockInputAtomComponent
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function validateGameName(name: string, expectedErrors: string[] = []) {
    const nameControl = component.gameForm.get('name');
    nameControl?.setValue(name);

    expectedErrors.forEach(errorKey => {
      expect(nameControl?.hasError(errorKey)).toBeTruthy();
    });

    if (expectedErrors.length === 0) {
      expect(nameControl?.valid).toBeTruthy();
    }
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty name', () => {
    expect(component.gameForm.get('name')?.value).toBe('');
  });

  it('should emit create game event when form is valid', () => {
    const createGameSpy = jest.spyOn(component.createGame, 'emit');
    const nameControl = component.gameForm.get('name');

    nameControl?.setValue('Partida Válida');
    component.onSubmit();

    expect(createGameSpy).toHaveBeenCalledWith({
      name: 'Partida Válida'
    });
  });

  it('should not emit create game event when form is invalid', () => {
    const createGameSpy = jest.spyOn(component.createGame, 'emit');
    const nameControl = component.gameForm.get('name');

    nameControl?.setValue('');
    component.onSubmit();

    expect(createGameSpy).not.toHaveBeenCalled();
  });


  it('should validate name length between 5 and 20 characters', () => {
    const name = '1234';
    const expectedErrors = ['length'];

    validateGameName(name, expectedErrors);

    const nameControl = component.gameForm.get('name');
    expect(nameControl?.hasError('length')).toBeTruthy();
  });

  it('should validate name does not have more than 3 numbers', () => {
    validateGameName('Game1234', ['tooManyNumbers']);
  });


  it('should reset error timeout after 5 seconds', fakeAsync(() => {
    component.showErrors = true;
    component.resetErrorTimeout();
    tick(5000);

    expect(component.showErrors).toBeFalsy();
  }));
});
