import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set default type to button', () => {
    expect(component.type).toBe('button');
  });

  it('should emit click event when not disabled', () => {
    const clickSpy = jest.spyOn(component.onClick, 'emit');

    component.handleClick();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', () => {
    const clickSpy = jest.spyOn(component.onClick, 'emit');

    component.disabled = true;
    component.handleClick();

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('should render submit type button', () => {
    component.type = 'submit';
    fixture.detectChanges();

    const buttonElement: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonElement.type).toBe('submit');
  });

  it('should disable button when disabled is true', () => {
    component.disabled = true;
    fixture.detectChanges();

    const buttonElement: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(buttonElement.disabled).toBeTruthy();
  });
});
