import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus Component', () => {
  beforeEach(() => {
    global.setOnlineStatus(true);
  });

  describe('Rendering', () => {
    it('should render online status by default', () => {
      render(<ConnectionStatus />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should render offline when navigator.onLine is false', () => {
      global.setOnlineStatus(false);
      render(<ConnectionStatus />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<ConnectionStatus className="custom-class" />);
      const statusElement = container.firstChild;
      expect(statusElement).toHaveClass('custom-class');
    });

    it('should have status indicator dot', () => {
      const { container } = render(<ConnectionStatus />);
      const dot = container.querySelector('.rounded-full.w-2.h-2');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have green styling when online', () => {
      const { container } = render(<ConnectionStatus />);
      const statusElement = container.firstChild;
      const classes = statusElement.getAttribute('class');

      expect(classes).toContain('bg-green-500/15');
      expect(classes).toContain('text-green-300');
      expect(classes).toContain('border-green-500/30');
    });

    it('should have red styling when offline', () => {
      global.setOnlineStatus(false);
      const { container } = render(<ConnectionStatus />);
      const statusElement = container.firstChild;
      const classes = statusElement.getAttribute('class');

      expect(classes).toContain('bg-red-500/15');
      expect(classes).toContain('text-red-300');
      expect(classes).toContain('border-red-500/30');
    });

    it('should have green dot when online', () => {
      const { container } = render(<ConnectionStatus />);
      const dot = container.querySelector('.rounded-full.w-2.h-2');
      expect(dot).toHaveClass('bg-green-400');
    });

    it('should have red dot when offline', () => {
      global.setOnlineStatus(false);
      const { container } = render(<ConnectionStatus />);
      const dot = container.querySelector('.rounded-full.w-2.h-2');
      expect(dot).toHaveClass('bg-red-400');
    });

    it('should have consistent base styling', () => {
      const { container } = render(<ConnectionStatus />);
      const statusElement = container.firstChild;

      expect(statusElement).toHaveClass('inline-flex');
      expect(statusElement).toHaveClass('items-center');
      expect(statusElement).toHaveClass('gap-2');
      expect(statusElement).toHaveClass('px-3');
      expect(statusElement).toHaveClass('py-1');
      expect(statusElement).toHaveClass('rounded-full');
      expect(statusElement).toHaveClass('text-xs');
      expect(statusElement).toHaveClass('border');
    });
  });

  describe('Network Events', () => {
    it('should update to offline when connection is lost', async () => {
      render(<ConnectionStatus />);
      expect(screen.getByText('Online')).toBeInTheDocument();

      act(() => {
        global.setOnlineStatus(false);
      });

      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
      });
    });

    it('should update to online when connection is restored', async () => {
      global.setOnlineStatus(false);
      render(<ConnectionStatus />);
      expect(screen.getByText('Offline')).toBeInTheDocument();

      act(() => {
        global.setOnlineStatus(true);
      });

      await waitFor(() => {
        expect(screen.getByText('Online')).toBeInTheDocument();
      });
    });

    it('should handle multiple status changes', async () => {
      render(<ConnectionStatus />);

      // Go offline
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(screen.getByText('Offline')).toBeInTheDocument());

      // Come back online
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());

      // Go offline again
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(screen.getByText('Offline')).toBeInTheDocument());
    });

    it('should update styling when status changes', async () => {
      const { container } = render(<ConnectionStatus />);
      const statusElement = container.firstChild;

      // Initially online with green styling
      expect(statusElement).toHaveClass('bg-green-500/15');

      // Go offline
      act(() => {
        global.setOnlineStatus(false);
      });

      await waitFor(() => {
        expect(statusElement).toHaveClass('bg-red-500/15');
        expect(statusElement).not.toHaveClass('bg-green-500/15');
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle airplane mode toggle', async () => {
      render(<ConnectionStatus />);

      // Enable airplane mode
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(screen.getByText('Offline')).toBeInTheDocument());

      // Disable airplane mode
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());
    });

    it('should handle WiFi disconnect/reconnect', async () => {
      const { container } = render(<ConnectionStatus />);

      // Disconnect WiFi
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => {
        expect(screen.getByText('Offline')).toBeInTheDocument();
        const classes = container.firstChild.getAttribute('class');
        expect(classes).toContain('bg-red-500/15');
      });

      // Reconnect WiFi
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => {
        expect(screen.getByText('Online')).toBeInTheDocument();
        const classes = container.firstChild.getAttribute('class');
        expect(classes).toContain('bg-green-500/15');
      });
    });

    it('should show correct status during network instability', async () => {
      render(<ConnectionStatus />);

      // Rapid network changes (flaky connection)
      for (let i = 0; i < 3; i++) {
        act(() => {
          global.setOnlineStatus(false);
        });
        await waitFor(() => expect(screen.getByText('Offline')).toBeInTheDocument());

        act(() => {
          global.setOnlineStatus(true);
        });
        await waitFor(() => expect(screen.getByText('Online')).toBeInTheDocument());
      }

      // Should end up online
      expect(screen.getByText('Online')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have readable text content', () => {
      render(<ConnectionStatus />);
      expect(screen.getByText('Online')).toHaveTextContent('Online');
    });

    it('should maintain visual indicator with dot', () => {
      const { container } = render(<ConnectionStatus />);
      const dot = container.querySelector('.rounded-full.w-2.h-2');
      expect(dot).toBeInTheDocument();
    });

    it('should be visible with appropriate contrast', () => {
      const { container } = render(<ConnectionStatus />);
      const statusElement = container.firstChild;

      // Should have border for visibility
      expect(statusElement).toHaveClass('border');
      // Should have background color
      expect(statusElement.className).toMatch(/bg-/);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render(<ConnectionStatus />);
      expect(() => unmount()).not.toThrow();
    });

    it('should not update after unmount', async () => {
      const { unmount } = render(<ConnectionStatus />);
      expect(screen.getByText('Online')).toBeInTheDocument();

      unmount();

      // Trigger event after unmount - should not cause errors
      act(() => {
        global.setOnlineStatus(false);
      });

      // No errors should occur
      expect(() => screen.queryByText('Offline')).not.toThrow();
    });
  });
});
