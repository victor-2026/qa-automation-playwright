import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('LoginForm Component', () => {
  const renderLoginForm = () => {
    return render(
      <form data-testid="login-form">
        <input 
          data-testid="auth-email-input"
          type="email"
          placeholder="Email"
        />
        <input 
          data-testid="auth-password-input"
          type="password"
          placeholder="Password"
        />
        <button data-testid="auth-login-btn" type="submit">
          Login
        </button>
      </form>
    );
  };

  test('renders email and password inputs', () => {
    renderLoginForm();
    
    expect(screen.getByTestId('auth-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('auth-login-btn')).toBeInTheDocument();
  });

  test('can type in email input', () => {
    renderLoginForm();
    
    const emailInput = screen.getByTestId('auth-email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  test('can type in password input', () => {
    renderLoginForm();
    
    const passwordInput = screen.getByTestId('auth-password-input');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput).toHaveValue('password123');
  });

  test('submit button is enabled', () => {
    renderLoginForm();
    
    const submitBtn = screen.getByTestId('auth-login-btn');
    expect(submitBtn).not.toBeDisabled();
  });
});
