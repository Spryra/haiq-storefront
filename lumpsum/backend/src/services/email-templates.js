// email-templates.js  — drop-in additions to your existing email.service.js
// Add these methods to the existing emailService object

const BRAND = {
  bg:      '#1A0A00',
  primary: '#B8752A',
  gold:    '#E8C88A',
  light:   '#F2EAD8',
  muted:   '#8C7355',
};

function baseLayout(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HAIQ Bakery</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};border:1px solid ${BRAND.primary}30;max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid ${BRAND.primary}25;text-align:center;">
            <p style="margin:0;color:${BRAND.primary};font-size:28px;font-weight:bold;letter-spacing:0.15em;">HAIQ</p>
            <p style="margin:6px 0 0;color:${BRAND.muted};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">Made For You</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px 32px;border-top:1px solid ${BRAND.primary}25;text-align:center;">
            <p style="margin:0;color:${BRAND.muted};font-size:11px;">HAIQ Bakery · Muyenga, Kampala, Uganda</p>
            <p style="margin:6px 0 0;color:${BRAND.muted};font-size:11px;">
              <a href="mailto:haiqafrica@gmail.com" style="color:${BRAND.primary};text-decoration:none;">haiqafrica@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="https://www.instagram.com/haiq_ug" style="color:${BRAND.primary};text-decoration:none;">@haiq_ug</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 8px;color:${BRAND.light};font-size:26px;font-weight:bold;line-height:1.2;">${text}</h1>`;
}
function rule() {
  return `<div style="width:40px;height:2px;background:${BRAND.primary};margin:16px 0 20px;"></div>`;
}
function p(text) {
  return `<p style="margin:0 0 16px;color:${BRAND.muted};font-size:14px;line-height:1.7;">${text}</p>`;
}
function btn(text, url) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${BRAND.primary};padding:0;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:${BRAND.bg};font-size:12px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}
function infoRow(label, value) {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.primary}15;">
      <span style="color:${BRAND.muted};font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">${label}</span>
      <br>
      <span style="color:${BRAND.light};font-size:14px;font-weight:bold;">${value}</span>
    </td>
  </tr>`;
}

// ── Exported template generators ──────────────────────────────────────────────

function newsletterWelcome({ email, name }) {
  return baseLayout(`
    ${h1(`Welcome, ${name}.`)}
    ${rule()}
    ${p('You\'re now part of the HAIQ inner circle. You\'ll be the first to know about new flavours, special days, and everything that comes out of our kitchen.')}
    ${p('We bake fresh every morning. Every order is personal. That\'s the deal.')}
    ${btn('Shop Now', 'https://haiq.ug/shop')}
    ${p(`<span style="font-size:12px;color:${BRAND.muted}40;">This email was sent to ${email}.</span>`)}
  `);
}

function loyaltyApproved({ name, card_number }) {
  return baseLayout(`
    ${h1(`Your HAIQ Card is Approved.`)}
    ${rule()}
    ${p(`${name}, your HAIQ loyalty card application has been approved.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${infoRow('Card Number', card_number)}
      ${infoRow('Status', 'Approved — Being Prepared')}
    </table>
    ${p('Your physical card will be dispatched to your delivery address shortly. You\'ll receive another email when it\'s on its way.')}
    ${p('In the meantime, your points keep accumulating with every order.')}
    ${btn('View My Account', 'https://haiq.ug/account')}
  `);
}

function loyaltyRejected({ name }) {
  return baseLayout(`
    ${h1('Your HAIQ Card Application.')}
    ${rule()}
    ${p(`${name}, after reviewing your application, we are unable to approve your HAIQ loyalty card at this time.`)}
    ${p('Keep ordering and building your points. You can reapply once your account activity meets our criteria.')}
    ${p('If you have any questions, reach out to us directly.')}
    ${btn('Contact Us', 'https://haiq.ug/contact')}
  `);
}

function loyaltyDispatched({ name, delivery_address }) {
  return baseLayout(`
    ${h1('Your HAIQ Card is On Its Way.')}
    ${rule()}
    ${p(`${name}, your physical HAIQ loyalty card has been dispatched.`)}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${infoRow('Delivery Address', delivery_address)}
      ${infoRow('Status', 'Dispatched')}
    </table>
    ${p('Present your card with future orders to earn and redeem points. Welcome to the inner circle.')}
    ${btn('View My Account', 'https://haiq.ug/account')}
  `);
}

module.exports = { newsletterWelcome, loyaltyApproved, loyaltyRejected, loyaltyDispatched };
