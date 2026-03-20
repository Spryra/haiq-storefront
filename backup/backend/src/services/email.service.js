const { Resend } = require('resend');
const { logger } = require('../config/logger');
const { STATUS_LABELS } = require('../config/constants');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = `${process.env.EMAIL_FROM_NAME || 'HAIQ Bakery'} <${process.env.EMAIL_FROM || 'orders@haiq.ug'}>`;

async function send({ to, subject, html }) {
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    logger.info('Email sent', { to, subject, id: result.id });
    return result;
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
    throw err;
  }
}

function brandedTemplate(title, body) {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { background: #0E0E10; color: #FBF8F4; font-family: 'Georgia', serif; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: 0.2em; color: #C19A6B; margin-bottom: 32px; }
  .title { font-size: 22px; color: #FBF8F4; margin-bottom: 16px; }
  .body { font-size: 16px; line-height: 1.7; color: #FBF8F4cc; }
  .cta { display: inline-block; background: #C19A6B; color: #0E0E10; padding: 14px 32px; text-decoration: none; font-weight: 700; letter-spacing: 0.05em; margin: 24px 0; }
  .divider { border: none; border-top: 1px solid #C19A6B44; margin: 32px 0; }
  .footer { font-size: 13px; color: #FBF8F4aa; }
  .status-badge { display: inline-block; background: #C19A6B22; color: #C19A6B; padding: 6px 16px; border: 1px solid #C19A6B44; font-size: 14px; }
</style></head>
<body><div class="container">
  <div class="logo">🍞 HAIQ</div>
  <div class="title">${title}</div>
  <div class="body">${body}</div>
  <hr class="divider">
  <div class="footer">© HAIQ Bakery, Kampala, Uganda. Premium baked with love.</div>
</div></body></html>
  `;
}

async function sendWelcome(user) {
  return send({
    to:      user.email,
    subject: 'Welcome to HAIQ — You\'re in the inner circle 🍞',
    html:    brandedTemplate(
      'Welcome to HAIQ, ' + user.first_name + '.',
      'Your account is ready. Browse our collection, build your own box, or just eat your feelings — we don\'t judge.<br><br><a href="' + process.env.FRONTEND_URL + '/shop" class="cta">Start Shopping</a>'
    ),
  });
}

async function sendOrderConfirmation({ order_number, tracking_token, email, first_name, total }) {
  const trackUrl = `${process.env.FRONTEND_URL}/track/${tracking_token}`;
  return send({
    to:      email,
    subject: `HAIQ Order Confirmed — ${order_number}`,
    html:    brandedTemplate(
      `Order Confirmed 🎉`,
      `Hi ${first_name},<br><br>
       Your order <strong>${order_number}</strong> has been received and payment is being processed.
       Total: <strong>UGX ${Number(total).toLocaleString()}</strong><br><br>
       <a href="${trackUrl}" class="cta">Track Your Order</a><br><br>
       We'll keep you updated at every step of the way.`
    ),
  });
}

async function sendStatusUpdate({ email, first_name, status, meta }) {
  return send({
    to:      email,
    subject: `Your HAIQ Order: ${meta.label} ${meta.emoji}`,
    html:    brandedTemplate(
      `${meta.label} ${meta.emoji}`,
      `Hi ${first_name},<br><br>
       Your order status has been updated:<br><br>
       <span class="status-badge">${meta.label} ${meta.emoji}</span><br><br>
       ${getStatusMessage(status)}`
    ),
  });
}

function getStatusMessage(status) {
  const msgs = {
    freshly_kneaded: 'Payment confirmed! Our bakers have started preparing your order. The magic begins now.',
    ovenbound:       'Your order is in the oven. This is where the real work happens. 🔥',
    on_the_cart:     'Packaged and ready to roll. Your order is waiting for pickup.',
    en_route:        'Your order is on its way! Our delivery team is heading to you. 🚴',
    delivered:       'Delivered! We hope every bite is exactly what you dreamed of. Enjoy. 🎉',
    cancelled:       'Your order has been cancelled. If this was unexpected, please contact us.',
  };
  return msgs[status] || '';
}

async function sendPasswordReset(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  return send({
    to:      email,
    subject: 'Reset your HAIQ password',
    html:    brandedTemplate(
      'Reset Your Password',
      `Click the button below to reset your password. This link expires in 1 hour.<br><br>
       <a href="${resetUrl}" class="cta">Reset Password</a><br><br>
       If you didn't request this, ignore this email.`
    ),
  });
}

module.exports = { sendWelcome, sendOrderConfirmation, sendStatusUpdate, sendPasswordReset };
