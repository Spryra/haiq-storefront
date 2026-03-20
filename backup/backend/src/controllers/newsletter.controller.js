const { pool } = require('../config/db');
const logger = require('../config/logger');

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    await pool.query(
      INSERT INTO newsletter_subscribers (email) VALUES () ON CONFLICT (email) DO UPDATE SET subscribed = true,
      [email]
    );
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    logger.error('Newsletter subscribe error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};

const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    await pool.query(UPDATE newsletter_subscribers SET subscribed = false WHERE email = , [email]);
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    logger.error('Newsletter unsubscribe error', err);
    res.status(500).json({ error: 'Internal error' });
  }
};

module.exports = { subscribe, unsubscribe };
