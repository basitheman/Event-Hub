const express = require('express');
const router = express.Router();
const queries = require('../db/scripts')
const { body, validationResult, query } = require('express-validator');
const pool = require('../db/pool');

// GET /events – list all events with search/filter
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = queries.getUpcomingEvents;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (e.title ILIKE $${idx} OR e.location ILIKE $${idx} OR e.organizer ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (category && category !== 'all') {
      query += ` AND e.category = $${idx}`;
      params.push(category);
      idx++;
    }

    query += ` GROUP BY e.id`;

    const sortMap = {
      date: ' ORDER BY e.event_date ASC',
      price_asc: ' ORDER BY e.price ASC',
      price_desc: ' ORDER BY e.price DESC',
      popular: ' ORDER BY tickets_sold DESC',
    };
    query += sortMap[sort] || ' ORDER BY e.event_date ASC';

    const { rows: events } = await pool.query(query, params);

    const categories = ['technology', 'music', 'business', 'workshop', 'food', 'sports', 'arts', 'general'];

    res.render('events/index', {
      title: 'Browse Events',
      events,
      categories,
      search: search || '',
      selectedCategory: category || 'all',
      selectedSort: sort || 'date',
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load events.');
    res.redirect('/');
  }
});

// GET /events/new – show create form
router.get('/new', (req, res) => {
  const categories = ['technology', 'music', 'business', 'workshop', 'food', 'sports', 'arts', 'general'];
  res.render('events/new', { title: 'Create Event', categories, errors: [], old: {} });
});

// POST /events – create event
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').trim().optional(),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('event_date').notEmpty().withMessage('Date & time is required').isISO8601().withMessage('Invalid date'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be zero or more'),
    body('organizer').trim().notEmpty().withMessage('Organizer name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const categories = ['technology', 'music', 'business', 'workshop', 'food', 'sports', 'arts', 'general'];

    if (!errors.isEmpty()) {
      return res.render('events/new', {
        title: 'Create Event',
        categories,
        errors: errors.array(),
        old: req.body,
      });
    }

    const { title, description, category, location, event_date, capacity, price, organizer } = req.body;

    try {
      const { rows } = await pool.query(
        `INSERT INTO events (title, description, category, location, event_date, capacity, price, organizer)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [title, description, category, location, event_date, capacity, price, organizer]
      );
      req.flash('success', 'Event created successfully!');
      res.redirect(`/events/${rows[0].id}`);
    } catch (err) {
      console.error(err);
      res.render('events/new', {
        title: 'Create Event',
        categories,
        errors: [{ msg: 'Database error. Please try again.' }],
        old: req.body,
      });
    }
  }
);

// GET /events/:id – event detail
router.get('/:id', async (req, res) => {
  try {
    const { rows: [event] } = await pool.query(queries.getEventById,[req.params.id]
    );

    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }

    const { rows: registrations } = await pool.query(
      `SELECT * FROM registrations WHERE event_id = $1 ORDER BY registered_at DESC`,
      [req.params.id]
    );

    res.render('events/show', {
      title: event.title,
      event,
      registrations,
      spotsLeft: event.capacity - Number(event.tickets_sold),
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load event.');
    res.redirect('/events');
  }
});

// GET /events/:id/edit – edit form
router.get('/:id/edit', async (req, res) => {
  try {
    const { rows: [event] } = await pool.query(queries.getEventSampleId, [req.params.id]);
    if (!event) {
      req.flash('error', 'Event not found.');
      return res.redirect('/events');
    }
    const categories = ['technology', 'music', 'business', 'workshop', 'food', 'sports', 'arts', 'general'];
    res.render('events/edit', { title: 'Edit Event', event, categories, errors: [], old: event });
  } catch (err) {
    req.flash('error', 'Failed to load event.');
    res.redirect('/events');
  }
});

// PUT /events/:id – update event
router.put(
  '/:id',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('event_date').notEmpty().isISO8601().withMessage('Valid date required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be positive'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be zero or more'),
    body('organizer').trim().notEmpty().withMessage('Organizer is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const categories = ['technology', 'music', 'business', 'workshop', 'food', 'sports', 'arts', 'general'];

    if (!errors.isEmpty()) {
      const { rows: [event] } = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
      return res.render('events/edit', {
        title: 'Edit Event',
        event,
        categories,
        errors: errors.array(),
        old: req.body,
      });
    }

    const { title, description, category, location, event_date, capacity, price, organizer } = req.body;

    try {
      await pool.query(queries.updateEvent,
        [title, description, category, location, event_date, capacity, price, organizer, req.params.id]
      );
      req.flash('success', 'Event updated successfully.');
      res.redirect(`/events/${req.params.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Update failed. Please try again.');
      res.redirect(`/events/${req.params.id}/edit`);
    }
  }
);

// DELETE /events/:id – cancel/delete event
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(queries.cancelEvent, [req.params.id]);
    req.flash('success', 'Event has been cancelled.');
    res.redirect('/events');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Could not cancel event.');
    res.redirect(`/events/${req.params.id}`);
  }
});

module.exports = router;
