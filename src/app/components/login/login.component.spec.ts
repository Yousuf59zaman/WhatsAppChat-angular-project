import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            login: () => of({ token: 't', refreshToken: 'r' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});

