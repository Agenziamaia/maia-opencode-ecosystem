/**
 * Trigger.dev Job: Email Reservation Parser
 *
 * Polls IMAP for new reservation emails
 * Extracts booking details and creates guests in local DB
 */

import { client } from '@trigger.dev/sdk';

client.defineJob({
  id: 'email-reservation-parser',
  name: 'Email Reservation Parser',
  version: '1.0.0',
  trigger: cron({
    cron: '*/15 * * * *', // Every 15 minutes
  }),
  integrations: {
    imap: {
      id: 'imap',
    },
  },
  run: async (payload, io) => {
    await io.logger.info('Starting email reservation parser');

    // Step 1: Fetch new emails from IMAP
    const emails = await io.runTask('fetch-emails', async () => {
      const response = await fetch(`${process.env.EMAIL_PARSER_URL}/api/emails/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.EMAIL_PARSER_API_KEY,
        },
        body: JSON.stringify({
          since: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // Last 15 minutes
        }),
      });

      return response.json();
    });

    await io.logger.info(`Found ${emails.length} new reservation emails`);

    if (emails.length === 0) {
      return { processed: 0, guestsCreated: 0 };
    }

    // Step 2: Parse each email
    const reservations = await Promise.all(
      emails.map((email: any) =>
        io.runTask(`parse-email-${email.id}`, async () => {
          // Use OpenAI to extract structured data
          const response = await fetch(`${process.env.AI_PARSER_URL}/api/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: email.body,
              schema: {
                guestName: 'string',
                checkInDate: 'date',
                checkOutDate: 'date',
                roomType: 'string',
                flightNumber: 'string',
                phone: 'string',
                email: 'string',
              },
            }),
          });

          const data = await response.json();
          return {
            ...data,
            sourceEmailId: email.id,
            sourceEmailFrom: email.from,
          };
        }),
      ),
    );

    // Step 3: Create guests in local DB
    const results = await Promise.all(
      reservations.map((reservation: any) =>
        io.runTask(`create-guest-${reservation.email}`, async () => {
          const response = await fetch(`${process.env.GATEWAY_URL}/api/mesh/commands`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.GATEWAY_API_KEY,
            },
            body: JSON.stringify({
              action: 'CREATE_GUEST',
              payload: reservation,
            }),
          });

          return response.json();
        }),
      ),
    );

    const successCount = results.filter((r) => r.success).length;

    await io.logger.info('Email reservation parsing completed', {
      processed: emails.length,
      guestsCreated: successCount,
    });

    // Step 4: Send welcome messages (batch)
    if (successCount > 0) {
      await io.runTask('send-welcome-messages', async () => {
        await fetch(`${process.env.GATEWAY_URL}/api/mesh/commands/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.GATEWAY_API_KEY,
          },
          body: JSON.stringify({
            commands: results
              .filter((r) => r.success)
              .map((r: any) => ({
                action: 'SEND_MESSAGE',
                payload: {
                  phone: r.data.phone,
                  message: generateWelcomeMessage(r.data),
                  template: 'welcome',
                },
              })),
          }),
        });
      });
    }

    return {
      processed: emails.length,
      guestsCreated: successCount,
      failed: emails.length - successCount,
    };
  },
});

/**
 * Generate welcome message
 */
function generateWelcomeMessage(guest: any): string {
  const checkIn = new Date(guest.checkInDate);
  const checkOut = new Date(guest.checkOutDate);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return (
    `🎉 Welcome ${guest.firstName}!\n\n` +
    `Your reservation at Hotel is confirmed!\n\n` +
    `📅 Check-in: ${checkIn.toLocaleDateString()}\n` +
    `📅 Check-out: ${checkOut.toLocaleDateString()}\n` +
    `🏨 Room: ${guest.roomType}\n` +
    `📍 Nights: ${nights}\n\n` +
    `We're excited to host you! If you have any questions before your arrival, just reply to this message. ✨`
  );
}
