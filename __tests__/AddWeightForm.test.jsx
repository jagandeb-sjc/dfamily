import { render, screen, fireEvent } from '@testing-library/react';
import AddWeightForm from '../components/AddWeightForm';

describe('AddWeightForm', () => {
  it('renders weight input and submit button', () => {
    const onSuccess = jest.fn();
    render(<AddWeightForm onSuccess={onSuccess} />);
    expect(screen.getByRole('spinbutton', { name: /weight/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log it/i })).toBeInTheDocument();
  });

  it('shows error when weight is empty', async () => {
    const onSuccess = jest.fn();
    render(<AddWeightForm onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /log it/i }));
    expect(await screen.findByText(/please enter your weight/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows error when weight is out of range', async () => {
    const onSuccess = jest.fn();
    render(<AddWeightForm onSuccess={onSuccess} />);
    const input = screen.getByRole('spinbutton', { name: /weight/i });
    fireEvent.change(input, { target: { value: '20' } });
    fireEvent.submit(screen.getByRole('form', { name: /log weight/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/lbs/);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess with weight and weekStart for valid input', async () => {
    const onSuccess = jest.fn().mockResolvedValue(undefined);
    render(<AddWeightForm onSuccess={onSuccess} />);
    const input = screen.getByRole('spinbutton', { name: /weight/i });
    fireEvent.change(input, { target: { value: '165' } });
    fireEvent.click(screen.getByRole('button', { name: /log it/i }));
    await screen.findByRole('button', { name: /log it/i });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    const [weight, weekStart] = onSuccess.mock.calls[0];
    expect(weight).toBe(165);
    expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
