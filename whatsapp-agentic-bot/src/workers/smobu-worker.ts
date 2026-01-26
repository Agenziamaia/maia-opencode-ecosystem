// OPS: Smobu Worker - Sync bookings from Smobu API
// Role: Fetch and update booking information from property management system

import axios from 'axios';

interface SmobuBooking {
  id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  check_in_date: string;
  check_out_date: string;
  room_number?: string;
  property_id?: string;
  status: string;
}

interface SyncData {
  startDate: string;
  endDate: string;
}

export async function syncSmobuBooking(data: SyncData | any, db: any) {
  const startTime = Date.now();

  try {
    // Handle different data formats
    let bookings: SmobuBooking[] = [];

    if (data.booking) {
      // Single booking sync
      bookings = [data.booking];
    } else if (data.startDate && data.endDate) {
      // Bulk sync
      bookings = await fetchBookingsFromSmobu(data.startDate, data.endDate);
    } else if (data.smobu_id) {
      // Fetch single booking by ID
      const booking = await fetchBookingFromSmobu(data.smobu_id);
      if (booking) bookings = [booking];
    }

    console.log(`🔄 Syncing ${bookings.length} bookings from Smobu`);

    // Process each booking
    let synced = 0;
    let created = 0;
    let updated = 0;

    for (const booking of bookings) {
      try {
        // Check if booking exists
        const existing = db.getBookingBySmobuId(booking.id);

        if (existing) {
          // Update existing
          updated++;
        } else {
          // Create new
          created++;
        }

        // Upsert booking
        db.upsertBooking(booking);
        synced++;
      } catch (error: any) {
        console.error(`❌ Error syncing booking ${booking.id}:`, error.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `✅ Synced ${synced} bookings (${created} new, ${updated} updated) in ${duration}ms`,
    );

    return {
      success: true,
      synced,
      created,
      updated,
      duration,
    };
  } catch (error: any) {
    console.error('❌ Error syncing Smobu bookings:', error.message);
    throw error;
  }
}

/**
 * Fetch bookings from Smobu API
 */
async function fetchBookingsFromSmobu(startDate: string, endDate: string): Promise<SmobuBooking[]> {
  try {
    const response = await axios.get(`${process.env.SMOBU_API_BASE_URL}/bookings`, {
      params: {
        property_id: process.env.SMOBU_PROPERTY_ID,
        start_date: startDate,
        end_date: endDate,
        status: 'confirmed', // Only sync confirmed bookings
      },
      headers: {
        Authorization: `Bearer ${process.env.SMOBU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return response.data.bookings || [];
  } catch (error: any) {
    console.error('❌ Error fetching bookings from Smobu:', error.message);
    throw error;
  }
}

/**
 * Fetch single booking from Smobu API
 */
async function fetchBookingFromSmobu(smobuId: string): Promise<SmobuBooking | null> {
  try {
    const response = await axios.get(`${process.env.SMOBU_API_BASE_URL}/bookings/${smobuId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SMOBU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    return response.data.booking || null;
  } catch (error: any) {
    console.error(`❌ Error fetching booking ${smobuId} from Smobu:`, error.message);
    return null;
  }
}
