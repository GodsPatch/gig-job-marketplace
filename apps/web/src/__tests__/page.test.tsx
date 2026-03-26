import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../app/page';

/**
 * HomePage render tests.
 *
 * Verifies the landing page renders correctly with:
 * - Main heading
 * - Key navigation links
 * - Feature cards
 */
describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Gig Job Marketplace');
  });

  it('should render navigation links', () => {
    render(<HomePage />);

    const registerLink = screen.getByRole('link', { name: /đăng ký ngay/i });
    const loginLink = screen.getByRole('link', { name: /đăng nhập/i });

    expect(registerLink).toHaveAttribute('href', '/register');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should render the feature cards', () => {
    render(<HomePage />);

    expect(screen.getByText('Tìm việc dễ dàng')).toBeDefined();
    expect(screen.getByText('Kết nối trực tiếp')).toBeDefined();
    expect(screen.getByText('Đánh giá minh bạch')).toBeDefined();
  });
});
