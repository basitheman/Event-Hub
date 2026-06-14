//events.js
const getUpcomingEvents = `      SELECT e.*,
        COUNT(r.id) AS registration_count,
        COALESCE(SUM(r.ticket_count), 0) AS tickets_sold
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      WHERE e.event_date >= NOW()
`
const getEventById = `SELECT e.*,
        COUNT(r.id) AS registration_count,
        COALESCE(SUM(r.ticket_count), 0) AS tickets_sold
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
       WHERE e.id = $1
       GROUP BY e.id`;

const getRegisterationEventByID = `SELECT * FROM registrations WHERE event_id = $1 ORDER BY registered_at DESC `

const createEvent = `INSERT INTO events (title, description, category, location, event_date, capacity, price, organizer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`

const getEventSampleId = 'SELECT * FROM events WHERE id = $1'

const updateEvent = `UPDATE events SET title=$1, description=$2, category=$3, location=$4,
         event_date=$5, capacity=$6, price=$7, organizer=$8, updated_at=NOW()
         WHERE id=$9`

const cancelEvent = 'UPDATE events SET is_cancelled = TRUE WHERE id = $1'

//Home.js 

const getFeatured = `SELECT e.*,
        COALESCE(SUM(r.ticket_count), 0) AS tickets_sold
       FROM events e
       LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
       WHERE e.event_date >= NOW() AND e.is_cancelled = FALSE
       GROUP BY e.id
       ORDER BY e.event_date ASC
       LIMIT 3`;

const getHomeStats = `
      SELECT
        (SELECT COUNT(*) FROM events WHERE is_cancelled = FALSE) AS total_events,
        (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed') AS total_registrations,
        (SELECT COUNT(DISTINCT attendee_email) FROM registrations) AS total_attendees
    `;

//registrations
const checkCapacity =
    `SELECT e.capacity, COALESCE(SUM(r.ticket_count),0) AS tickets_sold
         FROM events e
         LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
         WHERE e.id = $1 AND e.is_cancelled = FALSE
         GROUP BY e.capacity`;

const insertRegistration = `INSERT INTO registrations (event_id, attendee_name, attendee_email, attendee_phone, ticket_count, notes)
         VALUES ($1,$2,$3,$4,$5,$6)`;

const getUserRegistrations = `SELECT r.*, e.title AS event_title, e.event_date, e.location,
              e.price, e.is_cancelled, e.category
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.attendee_email = $1
       ORDER BY e.event_date ASC`;

const cancelRegistration =`UPDATE registrations SET status = 'cancelled' WHERE id = $1`;

module.exports = {
    getUpcomingEvents,
    getEventById,
    getRegisterationEventByID,
    createEvent,
    getEventSampleId,
    updateEvent,
    cancelEvent,
    getFeatured,
    getHomeStats,
    checkCapacity,
    insertRegistration,
    getUserRegistrations,
    cancelRegistration
}

