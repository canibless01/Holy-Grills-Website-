import { describe, expect, it } from 'vitest';
import {
  getNotifications,
  getNotificationPreferences,
  getBlasts,
} from '@/services/api/notifications.service';

describe('Notifications API Service', () => {
  it('returns empty array or items on getNotifications', async () => {
    const items = await getNotifications();
    expect(Array.isArray(items)).toBe(true);
  });

  it('fetches notification preferences fallback/response', async () => {
    const prefs = await getNotificationPreferences();
    expect(typeof prefs.push_enabled).toBe('boolean');
    expect(typeof prefs.email_enabled).toBe('boolean');
  });

  it('fetches blasts list', async () => {
    const blasts = await getBlasts();
    expect(Array.isArray(blasts)).toBe(true);
  });
});
