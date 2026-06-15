# EventHub – Event Booking Platform

A full-stack event booking platform built with **Express**, **EJS**, and **PostgreSQL**.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Server    | Node.js + Express                       |
| Templates | EJS with partials/layouts               |
| Database  | PostgreSQL + `pg` (node-postgres)       |
| Auth/UX   | express-session, connect-flash, method-override |
| Validation| express-validator                       |

---

## Features

- **Browse Events** – search, filter by category, sort by date/price/popularity
- **Event Detail** – full info, capacity bar, attendee list
- **Create Event** – full form with server-side validation
- **Edit Event** – update any event details
- **Cancel Event** – soft-delete via status flag
- **Register for Event** – book tickets with duplicate email guard
- **My Bookings** – look up all bookings by email
- **Cancel Registration** – cancel individual bookings
- EJS partials for head, nav, flash messages, footer, and event cards

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create PostgreSQL database
```bash
psql -U postgres
CREATE DATABASE eventhub;
\q
```

### 3. Run schema + seed data
```bash
psql -U postgres -d eventhub -f db/schema.sql
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials
```

### 5. Start the server
```bash
node app.js
# or: npm start
```

Open http://localhost:3000

---

## Project Structure

```
eventhub/
├── app.js                  # Express entry point
├── db/
│   ├── pool.js             # PostgreSQL connection pool
│   └── schema.sql          # Tables + seed data
├── middleware/
│   └── flash.js            # Flash message locals
├── routes/
│   ├── home.js             # GET /
│   ├── events.js           # CRUD /events
│   └── registrations.js    # CRUD /registrations
├── views/
│   ├── partials/           # head, nav, footer, flash, event-card
│   ├── events/             # index, show, new, edit
│   ├── registrations/      # lookup, index
│   ├── home.ejs
│   ├── 404.ejs
│   └── error.ejs
└── public/
    ├── css/style.css
    └── js/main.js
```

---

## Routes Reference

| Method | Path                    | Description             |
|--------|-------------------------|-------------------------|
| GET    | /                       | Home page               |
| GET    | /events                 | Browse/search events    |
| GET    | /events/new             | Create event form       |
| POST   | /events                 | Create event            |
| GET    | /events/:id             | Event detail            |
| GET    | /events/:id/edit        | Edit event form         |
| PUT    | /events/:id             | Update event            |
| DELETE | /events/:id             | Cancel event            |
| POST   | /registrations          | Register for event      |
| GET    | /registrations          | Lookup bookings by email|
| DELETE | /registrations/:id      | Cancel registration     |
