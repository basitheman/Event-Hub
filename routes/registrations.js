const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const queries = require('../db/scripts.js')

// POST /registrations – register for an event
router.post(
    '/',
    [
        body('event_id').notEmpty().withMessage('Event ID required'),
        body('attendee_name').trim().notEmpty().withMessage('Your name is required'),
        body('attendee_email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('attendee_phone').optional().trim(),
        body('ticket_count').isInt({ min: 1, max: 20 }).withMessage('Ticket count must be 1–20'),
        body('notes').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        const { event_id } = req.body;

        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join(', '));
            return res.redirect(`/events/${event_id}`);
        }

        const { attendee_name, attendee_email, attendee_phone, ticket_count, notes } = req.body;

        try {
            // Check capacity
            const { rows: [event] } = await pool.query(queries.checkCapacity, [event_id]);

            if (!event) {
                req.flash('error', 'Event not found or has been cancelled.');
                return res.redirect('/events');
            }

            const spotsLeft = event.capacity - Number(event.tickets_sold);
            if (Number(ticket_count) > spotsLeft) {
                req.flash('error', `Only ${spotsLeft} spot(s) remaining.`);
                return res.redirect(`/events/${event_id}`);
            }

            await pool.query(queries.insertRegistration,
                [event_id, attendee_name, attendee_email, attendee_phone || null, ticket_count, notes || null]
            );

            req.flash('success', `You're registered! Check your email at ${attendee_email}.`);
            res.redirect(`/registrations?email=${encodeURIComponent(attendee_email)}`);
        } catch (err) {
            if (err.code === '23505') {
                req.flash('error', 'This email is already registered for this event.');
            } else {
                console.error(err);
                req.flash('error', 'Registration failed. Please try again.');
            }
            res.redirect(`/events/${event_id}`);
        }
    }
);

// GET /registrations – view bookings by email
router.get('/', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.render('registrations/lookup', { title: 'My Bookings', errors: [], old: {} });
    }

    try {
        const { rows: registrations } = await pool.query(
            queries.getUserRegistrations,
            [email]
        );

        res.render('registrations/index', {
            title: 'My Bookings',
            registrations,
            email,
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not load bookings.');
        res.redirect('/registrations');
    }
});

// DELETE /registrations/:id – cancel a registration
router.delete('/:id', async (req, res) => {
    const { email } = req.body;
    try {
        await pool.query(queries.cancelRegistration,
            [req.params.id]
        );
        req.flash('success', 'Registration cancelled successfully.');
        res.redirect(`/registrations?email=${encodeURIComponent(email || '')}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Could not cancel registration.');
        res.redirect('/registrations');
    }
});

module.exports = router;
