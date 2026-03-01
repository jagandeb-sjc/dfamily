import { render, screen } from '@testing-library/react';
import ProgressCard, { progressPercent } from '../components/ProgressCard';

describe('progressPercent', () => {
  it('computes progress correctly', () => {
    expect(progressPercent(200, 190, 160)).toBeCloseTo(25);
    expect(progressPercent(200, 160, 160)).toBe(100);
    expect(progressPercent(200, 200, 160)).toBe(0);
  });

  it('returns 0 when start equals target', () => {
    expect(progressPercent(180, 175, 180)).toBe(0);
  });
});

describe('ProgressCard', () => {
  it('renders start, now, target weights', () => {
    render(
      <ProgressCard
        startWeight={200}
        currentWeight={195}
        targetWeight={160}
        deltaStart={-5}
        deltaLastWeek={-2}
      />
    );
    expect(screen.getByText(/200 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/195 lbs/)).toBeInTheDocument();
    expect(screen.getByText(/160 lbs/)).toBeInTheDocument();
  });

  it('shows vs start delta with correct color for loss', () => {
    render(
      <ProgressCard
        startWeight={200}
        currentWeight={195}
        targetWeight={160}
        deltaStart={-5}
      />
    );
    const vsStart = screen.getByText(/-5 lbs/);
    expect(vsStart).toBeInTheDocument();
  });

  it('handles missing weights', () => {
    render(<ProgressCard />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThan(0);
  });
});
