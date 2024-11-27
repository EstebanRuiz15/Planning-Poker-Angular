import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() customClass: string = '';
  @Output() onClick = new EventEmitter<void>();

  get buttonClasses() {
    return {
      'custom-button': true,
      [`${this.customClass}`]: !!this.customClass
    };
  }

  handleClick(): void {
    if (!this.disabled) {
      this.onClick.emit();
    }
  }
}
