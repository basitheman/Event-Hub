-- EventHub Database Schema

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  location VARCHAR(200) NOT NULL,
  event_date TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  organizer VARCHAR(100) NOT NULL,
  image_url VARCHAR(500),
  is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_name VARCHAR(100) NOT NULL,
  attendee_email VARCHAR(150) NOT NULL,
  attendee_phone VARCHAR(30),
  ticket_count INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, attendee_email)
);

-- Seed data
INSERT INTO events (title, description, category, location, event_date, capacity, price, organizer, image_url) VALUES
(
  'TechConf 2025 – The Future of AI',
  'A flagship technology conference bringing together developers, researchers, and innovators to explore the cutting edge of artificial intelligence, machine learning, and the tools reshaping the world.',
  'technology',
  'Grand Hyatt, Bucharest',
  NOW() + INTERVAL '14 days',
  300,
  49.00,
  'TechConf Romania',
  NULL
),
(
  'Jazz & Wine Evening',
  'An intimate evening of live jazz performances paired with curated wines from local vineyards. Perfect for unwinding and discovering new flavours in a relaxed, elegant setting.',
  'music',
  'Ateneul Român, Bucharest',
  NOW() + INTERVAL '7 days',
  80,
  35.00,
  'SoundScape Events',
  NULL
),
(
  'Startup Pitch Night',
  'Watch ten of Romania''s most ambitious early-stage startups pitch their ideas to a panel of investors and industry experts. Networking drinks follow the presentations.',
  'business',
  'Impact Hub, Cluj-Napoca',
  NOW() + INTERVAL '21 days',
  150,
  0.00,
  'StartupHub RO',
  NULL
),
(
  'Photography Workshop: Urban Landscapes',
  'A hands-on full-day workshop for intermediate photographers who want to capture the soul of the city. Covering composition, light, and post-processing in Lightroom.',
  'workshop',
  'Creative Quarter, Timișoara',
  NOW() + INTERVAL '30 days',
  20,
  75.00,
  'Lens & Light Studio',
  NULL
),
(
  'Romanian Food Festival',
  'Three days of traditional cuisine, craft beer, and folk music celebrating the best of Romania''s culinary heritage. Over 40 vendors, live cooking demos, and activities for families.',
  'food',
  'Herăstrău Park, Bucharest',
  NOW() + INTERVAL '45 days',
  500,
  12.00,
  'Taste of Romania',
  NULL
);
