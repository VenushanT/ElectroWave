import { render, screen } from '@testing-library/react';
import App from './App';

test('renders pilgrim water system heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/pilgrim water system/i);
  expect(headingElement).toBeInTheDocument();
});
