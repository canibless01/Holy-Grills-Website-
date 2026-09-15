import { describe, it, expect } from 'vitest';
import {
  getEvents,
  getEvent,
  getEventTicketTiers,
  getMyEventTickets,
} from '../services/api/events.service';

describe('Events API Service', () => {
  it('fetches campus events', async () => {
    const events = await getEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it('fetches event by id', async () => {
    const event = await getEvent('evt-1');
    expect(event).toBeDefined();
  });

  it('fetches ticket tiers for event', async () => {
    const tiers = await getEventTicketTiers('evt-1');
    expect(Array.isArray(tiers)).toBe(true);
  });

  it('fetches my event tickets', async () => {
    const tickets = await getMyEventTickets();
    expect(Array.isArray(tickets)).toBe(true);
  });
});
