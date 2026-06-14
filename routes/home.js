const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const queries = require('../db/scripts')
router.get('/', async (req, res) => {
  try {
    const { rows: featured } = await pool.query(queries.getFeatured);

    const { rows: [stats] } = await pool.query(queries.getHomeStats);

    res.render('home', { title: 'EventHub', featured, stats });
  } catch (err) {
    console.error(err);
    res.render('home', { title: 'EventHub', featured: [], stats: {} });
  }
});

module.exports = router;
