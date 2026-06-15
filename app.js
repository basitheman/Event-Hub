require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

const homeRouter = require('./routes/home');
const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'eventhub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 2 * 60 * 60 * 1000 }
}));


app.use('/', homeRouter);
app.use('/events', eventsRouter);
app.use('/registrations', registrationsRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Server Error', message: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎟  EventHub running at http://localhost:${PORT}\n`);
});
