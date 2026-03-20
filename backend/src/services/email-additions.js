// src/services/email-additions.js
// These functions must be added to your existing email.service.js
// Add them alongside the existing sendOrderConfirmation etc.
//
// Usage in email.service.js:
//   const { newsletterWelcomeHtml } = require('./email-additions');
//   Then call: await transporter.sendMail({ to, subject, html: newsletterWelcomeHtml(name) })
//
// OR if using Resend:
//   await resend.emails.send({ from, to, subject, html: newsletterWelcomeHtml(name) })

'use strict';

const BRAND = {
  bg:      '#1A0A00',
  surface: '#2A1200',
  primary: '#B8752A',
  gold:    '#E8C88A',
  light:   '#F2EAD8',
  muted:   '#8C7355',
  border:  '#3D2000',
};

function baseLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HAIQ Bakery</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.bg};padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" role="presentation"
        style="background:${BRAND.bg};border:1px solid ${BRAND.border};max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid ${BRAND.border};text-align:center;">
            <p style="margin:0;color:${BRAND.primary};font-family:'Georgia',serif;font-size:30px;font-weight:bold;letter-spacing:0.12em;">HAIQ</p>
            <p style="margin:6px 0 0;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">Made For You</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 32px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid ${BRAND.border};text-align:center;">
            <p style="margin:0;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:11px;">
              HAIQ Bakery &middot; Muyenga, Kampala, Uganda
            </p>
            <p style="margin:6px 0 0;font-family:'Arial',sans-serif;font-size:11px;">
              <a href="mailto:haiqafrica@gmail.com" style="color:${BRAND.primary};text-decoration:none;">haiqafrica@gmail.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://instagram.com/haiq_ug" style="color:${BRAND.primary};text-decoration:none;">@haiq_ug</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text, url) {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 0;">
    <tr>
      <td style="background:${BRAND.primary};">
        <a href="${url}"
          style="display:inline-block;padding:14px 32px;color:${BRAND.bg};font-family:'Arial',sans-serif;
                 font-size:11px;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

// ── Newsletter welcome ────────────────────────────────────────────────────────
function newsletterWelcomeHtml(name = 'Cookie Lover') {
  const body = `
    <h2 style="margin:0 0 6px;color:${BRAND.light};font-family:'Georgia',serif;font-size:26px;font-weight:bold;">
      Welcome, ${name}.
    </h2>
    <div style="width:40px;height:2px;background:${BRAND.primary};margin:14px 0 20px;"></div>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      You're now part of the HAIQ inner circle.
      You'll be the first to know about new flavours, special days, and everything
      that comes out of our kitchen.
    </p>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      We bake fresh every morning. Every order is personal.
    </p>
    ${btn('Shop Now', 'https://haiq.ug/shop')}
  `;
  return baseLayout(body);
}

// ── Loyalty approved ──────────────────────────────────────────────────────────
function loyaltyApprovedHtml({ name, cardNumber }) {
  const body = `
    <h2 style="margin:0 0 6px;color:${BRAND.light};font-family:'Georgia',serif;font-size:26px;font-weight:bold;">
      Your HAIQ Card is Approved.
    </h2>
    <div style="width:40px;height:2px;background:${BRAND.primary};margin:14px 0 20px;"></div>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      ${name}, your HAIQ loyalty card application has been reviewed and approved.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid ${BRAND.border};width:100%;">
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};">
          <span style="color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Card Number</span><br>
          <span style="color:${BRAND.light};font-family:'Georgia',serif;font-size:16px;font-weight:bold;">${cardNumber}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;">
          <span style="color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Status</span><br>
          <span style="color:${BRAND.primary};font-family:'Arial',sans-serif;font-size:14px;font-weight:bold;">Being Prepared for Dispatch</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      Your physical card will be dispatched to your delivery address shortly.
      You'll receive another email the moment it's on its way.
    </p>
    ${btn('View My Account', 'https://haiq.ug/account')}
  `;
  return baseLayout(body);
}

// ── Loyalty rejected ──────────────────────────────────────────────────────────
function loyaltyRejectedHtml({ name }) {
  const body = `
    <h2 style="margin:0 0 6px;color:${BRAND.light};font-family:'Georgia',serif;font-size:26px;font-weight:bold;">
      Your HAIQ Card Application.
    </h2>
    <div style="width:40px;height:2px;background:${BRAND.primary};margin:14px 0 20px;"></div>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      ${name}, after reviewing your application we are unable to approve your
      HAIQ loyalty card at this time.
    </p>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      Keep ordering and building your points. You can reapply once your
      account activity meets our criteria.
    </p>
    ${btn('Contact Us', 'https://haiq.ug/contact')}
  `;
  return baseLayout(body);
}

// ── Loyalty dispatched ────────────────────────────────────────────────────────
function loyaltyDispatchedHtml({ name, deliveryAddress }) {
  const body = `
    <h2 style="margin:0 0 6px;color:${BRAND.light};font-family:'Georgia',serif;font-size:26px;font-weight:bold;">
      Your HAIQ Card is On Its Way.
    </h2>
    <div style="width:40px;height:2px;background:${BRAND.primary};margin:14px 0 20px;"></div>
    <p style="margin:0 0 16px;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      ${name}, your physical HAIQ loyalty card has been dispatched.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid ${BRAND.border};width:100%;">
      <tr>
        <td style="padding:12px 16px;">
          <span style="color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;">Delivery Address</span><br>
          <span style="color:${BRAND.light};font-family:'Arial',sans-serif;font-size:14px;">${deliveryAddress}</span>
        </td>
      </tr>
    </table>
    <p style="margin:0;color:${BRAND.muted};font-family:'Arial',sans-serif;font-size:14px;line-height:1.7;">
      Present your card with future orders to earn and redeem points.
      Welcome to the inner circle.
    </p>
    ${btn('View My Account', 'https://haiq.ug/account')}
  `;
  return baseLayout(body);
}

module.exports = {
  newsletterWelcomeHtml,
  loyaltyApprovedHtml,
  loyaltyRejectedHtml,
  loyaltyDispatchedHtml,
};
