import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            register: () => of({ token: 't', refreshToken: 'r' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});

