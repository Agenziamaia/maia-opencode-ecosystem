/**
 * Trigger.dev Job: Flight Delay Alert
 *
 * Triggered by FlightAware API polling
 * Notifies affected guests via local WhatsApp bot
 */

import { client } from '@trigger.dev/sdk';

// Initialize Trigger.dev client
client.defineJob({
  id: 'flight-delay-alert',
  name: 'Flight Delay Notification',
  version: '1.0.0',
  trigger: eventTrigger({
    name: 'flight.delay.detected',
  }),
  integrations: {},
  run: async (payload, io) => {
    await io.logger.info('Flight delay detected', {
      flightNumber: payload.flightNumber,
      delayMinutes: payload.delayMinutes,
    });

    // Step 1: Fetch affected guests from local gateway
    const guests = await io.runTask('find-affected-guests', async () => {
      const response = await fetch(`${process.env.GATEWAY_URL}/api/mesh/guests/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.GATEWAY_API_KEY,
        },
        body: JSON.stringify({
          flightNumber: payload.flightNumber,
          checkInDate: payload.estimatedArrivalDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to query guests: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    });

    await io.logger.info(`Found ${guests.length} affected guests`);

    if (guests.length === 0) {
      await io.logger.info('No guests to notify');
      return { notified: 0, guests: [] };
    }

    // Step 2: Send notifications to each guest via local gateway
    const results = await Promise.all(
      guests.map(async (guest: any) => {
        try {
          await io.sendEvent('send-whatsapp-notification', {
            name: 'whatsapp.send',
            payload: {
              phone: guest.phone,
              message: generateDelayMessage(payload, guest),
              template: 'flight-delay-notification',
              guestId: guest.id,
            },
          });

          // Also update guest status in local DB
          await io.sendEvent('update-guest-status', {
            name: 'guest.update',
            payload: {
              guestId: guest.id,
              updates: {
                status: 'flight-delay-notified',
                notifiedAt: new Date().toISOString(),
              },
            },
          });

          return { success: true, guestId: guest.id, phone: guest.phone };
        } catch (error: any) {
          await io.logger.error('Failed to notify guest', {
            guestId: guest.id,
            error: error.message,
          });

          return { success: false, guestId: guest.id, error: error.message };
        }
      }),
    );

    const successCount = results.filter((r) => r.success).length;

    await io.logger.info('Flight delay notifications completed', {
      total: guests.length,
      success: successCount,
      failed: guests.length - successCount,
    });

    return {
      notified: successCount,
      failed: guests.length - successCount,
      results,
    };
  },
});

/**
 * Generate personalized delay message
 */
function generateDelayMessage(flight: any, guest: any): string {
  const guestName = guest.firstName || 'Guest';
  const delayHours = Math.floor(flight.delayMinutes / 60);
  const delayMins = flight.delayMinutes % 60;
  const delayStr = delayHours > 0 ? `${delayHours}h ${delayMins}m` : `${delayMins} minutes`;

  return (
    `🛫 Hello ${guestName}!\n\n` +
    `⚠️ Your flight ${flight.flightNumber} is delayed by ${delayStr}.\n` +
    `New arrival time: ${flight.newArrivalTime}\n\n` +
    `Your airport pickup has been rescheduled accordingly. ` +
    `We'll be waiting for you when you land! ✨\n\n` +
    `If you have any questions, just reply to this message.`
  );
}
