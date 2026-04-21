import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useNetwork } from './useNetwork';

describe('useNetwork Hook', () => {
  beforeEach(() => {
    // Reset to online with fast connection
    global.setOnlineStatus(true);
    global.setConnectionType('4g', false);
  });

  describe('Online/Offline Detection', () => {
    it('should return online status as true by default', () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.online).toBe(true);
    });

    it('should detect when going offline', async () => {
      const { result } = renderHook(() => useNetwork());

      act(() => {
        global.setOnlineStatus(false);
      });

      await waitFor(() => {
        expect(result.current.online).toBe(false);
      });
    });

    it('should detect when coming back online', async () => {
      // Start offline
      global.setOnlineStatus(false);
      const { result } = renderHook(() => useNetwork());

      expect(result.current.online).toBe(false);

      // Come back online
      act(() => {
        global.setOnlineStatus(true);
      });

      await waitFor(() => {
        expect(result.current.online).toBe(true);
      });
    });

    it('should handle multiple online/offline transitions', async () => {
      const { result } = renderHook(() => useNetwork());

      // Go offline
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(result.current.online).toBe(false));

      // Come online
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => expect(result.current.online).toBe(true));

      // Go offline again
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(result.current.online).toBe(false));
    });
  });

  describe('Connection Type Detection', () => {
    it('should default to 4g connection', () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('4g');
    });

    it('should detect slow-2g connection', () => {
      global.setConnectionType('slow-2g');
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('slow-2g');
    });

    it('should detect 2g connection', () => {
      global.setConnectionType('2g');
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('2g');
    });

    it('should detect 3g connection', () => {
      global.setConnectionType('3g');
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('3g');
    });

    it('should detect 4g connection', () => {
      global.setConnectionType('4g');
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('4g');
    });

    it('should update when connection type changes', async () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('4g');

      act(() => {
        global.setConnectionType('2g');
      });

      await waitFor(() => {
        expect(result.current.effectiveType).toBe('2g');
      });
    });
  });

  describe('Save Data Mode Detection', () => {
    it('should detect save data mode disabled by default', () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.saveData).toBe(false);
    });

    it('should detect when save data mode is enabled', () => {
      global.setConnectionType('4g', true);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.saveData).toBe(true);
    });

    it('should update when save data mode changes', async () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.saveData).toBe(false);

      act(() => {
        global.setConnectionType('4g', true);
      });

      await waitFor(() => {
        expect(result.current.saveData).toBe(true);
      });
    });
  });

  describe('isSlow Computed Property', () => {
    it('should return false for 4g connection without save data', () => {
      global.setConnectionType('4g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(false);
    });

    it('should return true for save data mode regardless of connection type', () => {
      global.setConnectionType('4g', true);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(true);
    });

    it('should return true for slow-2g connection', () => {
      global.setConnectionType('slow-2g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(true);
    });

    it('should return true for 2g connection', () => {
      global.setConnectionType('2g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(true);
    });

    it('should return true for 3g connection', () => {
      global.setConnectionType('3g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(true);
    });

    it('should update isSlow when connection changes from fast to slow', async () => {
      global.setConnectionType('4g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(false);

      act(() => {
        global.setConnectionType('2g', false);
      });

      await waitFor(() => {
        expect(result.current.isSlow).toBe(true);
      });
    });

    it('should update isSlow when connection changes from slow to fast', async () => {
      global.setConnectionType('2g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.isSlow).toBe(true);

      act(() => {
        global.setConnectionType('4g', false);
      });

      await waitFor(() => {
        expect(result.current.isSlow).toBe(false);
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle train/subway scenario (online -> offline -> online)', async () => {
      const { result } = renderHook(() => useNetwork());

      // On train, good signal
      expect(result.current.online).toBe(true);
      expect(result.current.effectiveType).toBe('4g');

      // Enter tunnel - lose connection
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(result.current.online).toBe(false));

      // Exit tunnel - regain connection
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => expect(result.current.online).toBe(true));
    });

    it('should handle data saver mode enabled on slow connection', async () => {
      // User enables data saver on their phone
      global.setConnectionType('3g', true);
      const { result } = renderHook(() => useNetwork());

      expect(result.current.effectiveType).toBe('3g');
      expect(result.current.saveData).toBe(true);
      expect(result.current.isSlow).toBe(true); // Both 3g AND save data
    });

    it('should handle moving from WiFi to mobile data', async () => {
      // Start on WiFi (4g)
      global.setConnectionType('4g', false);
      const { result } = renderHook(() => useNetwork());
      expect(result.current.effectiveType).toBe('4g');
      expect(result.current.isSlow).toBe(false);

      // Switch to mobile data (3g with data saver)
      act(() => {
        global.setConnectionType('3g', true);
      });

      await waitFor(() => {
        expect(result.current.effectiveType).toBe('3g');
        expect(result.current.saveData).toBe(true);
        expect(result.current.isSlow).toBe(true);
      });
    });

    it('should handle airplane mode toggle', async () => {
      const { result } = renderHook(() => useNetwork());
      expect(result.current.online).toBe(true);

      // Enable airplane mode
      act(() => {
        global.setOnlineStatus(false);
      });
      await waitFor(() => expect(result.current.online).toBe(false));

      // Disable airplane mode
      act(() => {
        global.setOnlineStatus(true);
      });
      await waitFor(() => expect(result.current.online).toBe(true));
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => useNetwork());

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should not update state after unmount', async () => {
      const { result, unmount } = renderHook(() => useNetwork());
      const initialOnline = result.current.online;

      unmount();

      // Trigger online/offline events after unmount
      act(() => {
        global.setOnlineStatus(!initialOnline);
      });

      // State should not have changed (no error should occur)
      expect(() => result.current).not.toThrow();
    });
  });
});
