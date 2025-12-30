import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { describe, it, expect } from 'jest';

describe('EmptyState', () => {
  it('renders with default props', () => {
    render(<EmptyState />);

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    expect(screen.getByText(
      "Get started by creating your first task. You'll be amazed at how much you can accomplish!"
    )).toBeInTheDocument();
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <EmptyState
        type="no-search-results"
        title="Custom Title"
        message="Custom message"
        actionText="Custom Action"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('does not show action button when showAction is false', () => {
    render(<EmptyState showAction={false} />);

    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });

  it('renders different types correctly', () => {
    const { rerender } = render(<EmptyState type="no-tasks" />);

    expect(screen.getByText('No tasks yet')).toBeInTheDocument();

    rerender(<EmptyState type="no-search-results" />);

    expect(screen.getByText('No results found')).toBeInTheDocument();

    rerender(<EmptyState type="no-projects" />);

    expect(screen.getByText('No projects yet')).toBeInTheDocument();

    rerender(<EmptyState type="no-notifications" />);

    expect(screen.getByText('No notifications')).toBeInTheDocument();

    rerender(<EmptyState type="custom" />);

    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState className="custom-class" />);

    expect(screen.getByRole('group')).toHaveClass('custom-class');
  });

  it('uses custom illustration when provided', () => {
    const customIllustration = <div data-testid="custom-illustration">Custom</div>;
    render(<EmptyState illustration={customIllustration} />);

    expect(screen.getByTestId('custom-illustration')).toBeInTheDocument();
  });
});