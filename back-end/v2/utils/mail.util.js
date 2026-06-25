'use strict'

const https = require('https')
const settings = require('../config').default

const BRAND = 'CR Travel Service'
const BRAND_COLOR = '#0b8f6a'

function brevoSend(apiKey, payload) {
  return new Promise(function (resolve, reject) {
    const body = JSON.stringify(payload)
    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body)
      }
    }
    const req = https.request(options, function (res) {
      let data = ''
      res.on('data', function (chunk) { data += chunk })
      res.on('end', function () {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error('Brevo API ' + res.statusCode + ': ' + data))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function wrap(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f4f7fb; font-family:Arial,sans-serif; -webkit-text-size-adjust:100%; }
    .wrapper { background:#f4f7fb; padding:24px 12px; }
    .card { background:#ffffff; border-radius:12px; overflow:hidden; max-width:560px; margin:0 auto; }
    .header { background:${BRAND_COLOR}; padding:24px 28px; }
    .header h1 { margin:0; color:#ffffff; font-size:20px; font-weight:700; }
    .header p { margin:4px 0 0; color:rgba(255,255,255,.8); font-size:13px; }
    .body { padding:28px 28px; }
    .footer { background:#f4f7fb; padding:16px 28px; text-align:center; }
    .footer p { margin:0; color:#8a9ab0; font-size:11px; }
    .footer a { color:${BRAND_COLOR}; text-decoration:none; }
    .btn { display:inline-block; background:${BRAND_COLOR}; color:#ffffff !important; padding:13px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px; margin-top:4px; }
    .shuttle-block { border:1px solid #eef1f6; border-radius:8px; margin-bottom:8px; padding:14px 16px; }
    .shuttle-block .route { font-size:15px; font-weight:700; color:#1a2636; margin:0 0 6px; }
    .shuttle-block .meta { font-size:13px; color:#607086; margin:0; }
    .info-row { display:flex; padding:6px 0; border-bottom:1px solid #f0f3f7; }
    .info-label { font-size:13px; color:#8a9ab0; min-width:110px; }
    .info-value { font-size:14px; color:#1a2636; font-weight:600; }
    .highlight-box { background:#fff8e1; border:1px solid #ffe082; border-radius:8px; padding:18px 20px; margin-bottom:24px; }
    .highlight-box p { margin:0 0 10px; font-size:14px; color:#607086; line-height:1.6; }
    .highlight-box p:first-child { font-weight:700; color:#1a2636; margin-bottom:12px; }
    .cred-email { font-size:14px; font-weight:700; color:#1a2636; word-break:break-all; }
    .cred-pass { font-size:24px; font-weight:700; color:${BRAND_COLOR}; letter-spacing:4px; }
    @media only screen and (max-width:480px) {
      .wrapper { padding:12px 8px !important; }
      .header { padding:20px 20px !important; }
      .body { padding:22px 20px !important; }
      .footer { padding:14px 20px !important; }
      .btn { display:block !important; text-align:center !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>${BRAND}</h1>
        <p>Private shuttle transportation &middot; Costa Rica</p>
      </div>
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>${BRAND} &middot; Costa Rica &middot; <a href="https://crtravelservice.com">crtravelservice.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
}

function shuttleBlocks(shuttles) {
  if (!shuttles || !shuttles.length) return ''
  return shuttles.map(function (s, i) {
    const from = (s.departing && s.departing.name) || s.departingId || '—'
    const to = (s.destination && s.destination.name) || s.destinationId || '—'
    const date = s.date ? new Date(s.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
    return '<div class="shuttle-block"><p class="route">Transfer ' + (i + 1) + ': ' + from + ' &rarr; ' + to + '</p><p class="meta">' + date + ' &nbsp;&bull;&nbsp; ' + (s.persons || 1) + ' passenger' + ((s.persons || 1) !== 1 ? 's' : '') + '</p></div>'
  }).join('')
}

function infoRow(label, value) {
  return '<div class="info-row"><span class="info-label">' + label + '</span><span class="info-value">' + value + '</span></div>'
}

async function send(to, subject, html) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.log(`[Mail] SKIP — no BREVO_API_KEY | to: ${to} | subject: ${subject}`)
    return
  }
  const fromEmail = settings.mailSettings.from || settings.mailSettings.user
  console.log(`[Mail] SENDING | to: ${to} | subject: ${subject}`)
  try {
    const result = await brevoSend(apiKey, {
      sender: { name: BRAND, email: fromEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html
    })
    console.log(`[Mail] OK | to: ${to} | subject: ${subject} | messageId: ${result.messageId || '—'}`)
  } catch (e) {
    console.error(`[Mail] FAIL | to: ${to} | subject: ${subject}`)
    console.error(e)
  }
}

async function getCompanyEmail() {
  try {
    const Company = require('../models/company.model').default
    const company = await Company.findOne({ where: { isDefault: true } })
    return (company && company.email) || settings.mailSettings.user
  } catch (e) {
    return settings.mailSettings.user
  }
}

// ─── Email templates ─────────────────────────────────────────────────────────

const Mail = {

  async emailVerification(user, code) {
    const subject = `Your ${BRAND} verification code`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;font-weight:800;">Verify your email</h2>
      <p style="color:#607086;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${user.name}, use the code below to complete your account registration.
      </p>
      <div style="text-align:center;margin:0 0 28px;padding:24px 16px;background:#f4f7fb;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
        <span style="font-size:40px;font-weight:800;letter-spacing:10px;color:#1a2636;">${code}</span>
      </div>
      <p style="color:#8a9ab0;font-size:13px;margin:0;text-align:center;">Expires in 30 minutes &nbsp;&bull;&nbsp; If you didn't request this, ignore this email.</p>
    `)
    await send(user.email, subject, html)
  },

  async guestAccountCreated(user, tempPassword, reservation) {
    const subject = `Reservation #${reservation.id} confirmed — your account details`
    const shuttles = (reservation && reservation.shuttles) || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;font-weight:800;">Your transfer is booked, ${user.name}!</h2>
      <p style="color:#607086;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We received your request. Our team will confirm the driver and vehicle shortly.
      </p>

      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a9ab0;margin:0 0 10px;">Reservation #${reservation.id}</p>
      ${shuttleBlocks(shuttles)}
      ${reservation.message ? '<p style="background:#f7f9fc;border-radius:8px;padding:12px 14px;color:#607086;font-size:13px;margin:12px 0 0;"><strong>Notes:</strong> ' + reservation.message + '</p>' : ''}

      <div style="height:1px;background:#eef1f6;margin:24px 0;"></div>

      <div class="highlight-box">
        <p>Your account was created automatically</p>
        <p>Use these credentials to log in and track your reservation. You will be asked to set a new password on first login.</p>
        <p style="margin:0 0 4px;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Email</p>
        <p class="cred-email" style="margin:0 0 14px;">${user.email}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Temporary password</p>
        <p class="cred-pass" style="margin:0;">${tempPassword}</p>
      </div>

      <p style="margin:0 0 20px;font-size:14px;color:#607086;line-height:1.6;">
        Once logged in you can view reservation details, trip updates, and messages from our team.
      </p>
      <a href="${settings.clientUrl}/login" class="btn">Log in &amp; view your reservation</a>
    `)
    await send(user.email, subject, html)
  },

  async welcomeCustomer(user) {
    const subject = `Welcome to ${BRAND}`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;font-weight:800;">Welcome, ${user.name}!</h2>
      <p style="color:#607086;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Your account is ready. You can now book private shuttles, track your reservations, and leave reviews from your account page.
      </p>
      <a href="${settings.clientUrl}" class="btn">Go to your account</a>
    `)
    await send(user.email, subject, html)
  },

  async reservationConfirmedCustomer(reservation, user) {
    const subject = `Reservation #${reservation.id} received — ${BRAND}`
    const shuttles = reservation.shuttles || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;font-weight:800;">Transfer request confirmed</h2>
      <p style="color:#607086;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Hi ${user.name}, we received your booking. Our team will send you a final confirmation with the driver and vehicle assignment.
      </p>
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a9ab0;margin:0 0 10px;">Reservation #${reservation.id}</p>
      ${shuttleBlocks(shuttles)}
      ${reservation.message ? '<p style="background:#f7f9fc;border-radius:8px;padding:12px 14px;color:#607086;font-size:13px;margin:12px 0 24px;"><strong>Notes:</strong> ' + reservation.message + '</p>' : '<div style="height:24px;"></div>'}
      <p style="color:#607086;font-size:13px;margin:0;">Questions? Reply to this email or reach us on WhatsApp.</p>
    `)
    await send(user.email, subject, html)
  },

  async reservationNotifyCompany(reservation, user) {
    const companyEmail = await getCompanyEmail()
    const subject = `New reservation #${reservation.id} — ${user.name} ${user.lastName || ''}`
    const shuttles = reservation.shuttles || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 16px;color:#1a2636;font-size:20px;font-weight:800;">New booking request</h2>
      ${infoRow('Customer', user.name + ' ' + (user.lastName || ''))}
      ${infoRow('Email', '<a href="mailto:' + user.email + '" style="color:' + BRAND_COLOR + ';">' + user.email + '</a>')}
      ${infoRow('Phone', user.phone || '—')}
      <div style="height:1px;background:#eef1f6;margin:16px 0;"></div>
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a9ab0;margin:0 0 10px;">Transfers</p>
      ${shuttleBlocks(shuttles)}
      ${reservation.message ? '<p style="background:#f7f9fc;border-radius:8px;padding:12px 14px;color:#607086;font-size:13px;margin:12px 0 0;"><strong>Notes:</strong> ' + reservation.message + '</p>' : ''}
    `)
    await send(companyEmail, subject, html)
  },

  async reservationConfirmedByCompany(reservation, user) {
    const subject = `Reservation #${reservation.id} confirmed — ${BRAND}`
    const shuttles = reservation.shuttles || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;font-weight:800;">Your reservation is confirmed, ${user.name}!</h2>
      <p style="color:#607086;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Great news — our team has reviewed your transfer request and everything is set. Your driver and vehicle will be ready for your pickup.
      </p>
      <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#8a9ab0;margin:0 0 10px;">Reservation #${reservation.id}</p>
      ${shuttleBlocks(shuttles)}
      ${reservation.message ? '<p style="background:#f7f9fc;border-radius:8px;padding:12px 14px;color:#607086;font-size:13px;margin:12px 0 0;"><strong>Your notes:</strong> ' + reservation.message + '</p>' : ''}
      ${reservation.companyNotes ? '<div style="background:#eef8f5;border:1px solid #b2e0d0;border-radius:8px;padding:14px 16px;margin-top:16px;"><p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#0b8f6a;">Note from our team</p><p style="margin:0;font-size:14px;color:#1a2636;line-height:1.6;">' + reservation.companyNotes + '</p></div>' : ''}
      <div style="height:1px;background:#eef1f6;margin:24px 0;"></div>
      <p style="color:#607086;font-size:13px;margin:0 0 20px;line-height:1.6;">Questions or changes? Reply to this email or reach us on WhatsApp before your travel date.</p>
      <a href="${settings.clientUrl}/account" class="btn">View your reservation</a>
    `)
    await send(user.email, subject, html)
  },

  async reviewSubmitted(testimonial, user) {
    const companyEmail = await getCompanyEmail()
    const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5))
    const subject = `New review from ${testimonial.name || user} — ${testimonial.rating}/5`
    const html = wrap(subject, `
      <h2 style="margin:0 0 16px;color:#1a2636;font-size:20px;font-weight:800;">New review submitted</h2>
      <p style="color:#f59e0b;font-size:26px;margin:0 0 16px;letter-spacing:2px;">${stars}</p>
      ${infoRow('Name', testimonial.name)}
      ${infoRow('Location', testimonial.location || '—')}
      ${infoRow('Route', testimonial.route || '—')}
      <div style="height:1px;background:#eef1f6;margin:16px 0;"></div>
      <blockquote style="border-left:4px solid ${BRAND_COLOR};margin:0 0 16px;padding:12px 16px;background:#f7f9fc;border-radius:0 8px 8px 0;color:#1a2636;font-size:14px;line-height:1.6;">"${testimonial.comment}"</blockquote>
      <p style="color:#607086;font-size:13px;margin:0;">Review is pending approval — activate it from the admin panel.</p>
    `)
    await send(companyEmail, subject, html)
  },

  getCompanyEmail,

  async contactMessage(message, companyEmail) {
    const subject = `New contact message from ${message.name}`
    const html = wrap(subject, `
      <h2 style="margin:0 0 16px;color:#1a2636;font-size:20px;font-weight:800;">New contact message</h2>
      ${infoRow('Name', message.name)}
      ${infoRow('Email', '<a href="mailto:' + message.email + '" style="color:' + BRAND_COLOR + ';">' + message.email + '</a>')}
      ${infoRow('Phone', message.phone || '—')}
      <div style="height:1px;background:#eef1f6;margin:16px 0;"></div>
      <blockquote style="border-left:4px solid ${BRAND_COLOR};margin:0;padding:12px 16px;background:#f7f9fc;border-radius:0 8px 8px 0;color:#1a2636;font-size:14px;line-height:1.6;">${message.text}</blockquote>
    `)
    await send(companyEmail, subject, html)
  }
}

module.exports = Mail
