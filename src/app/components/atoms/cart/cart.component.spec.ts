import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept number input', () => {
    component.number = 5;
    fixture.detectChanges();
    expect(component.number).toBe(5);

    component.number = '10';
    fixture.detectChanges();
    expect(component.number).toBe('10');
  });

  it('should render number in template', () => {
    component.number = 5;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-number')?.textContent).toContain('5');

    component.number = '15';
    fixture.detectChanges();
    expect(compiled.querySelector('.cart-number')?.textContent).toContain('15');
  });
});
