'use strict'

const nodemailer = require('nodemailer')
const settings = require('../config').default

const BRAND = 'CR Travel Service'
const BRAND_COLOR = '#0b8f6a'

function createTransporter() {
  const { user, pass, host, port } = settings.mailSettings
  if (!user || !pass) return null
  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port || 465,
    secure: port === 465 || (!port && true),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: { rejectUnauthorized: false },
    auth: { user, pass: pass.replace(/\s/g, '') }
  })
}

function wrap(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
        <tr><td style="background:${BRAND_COLOR};padding:28px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${BRAND}</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.8);font-size:14px;">Private shuttle transportation · Costa Rica</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:#f4f7fb;padding:20px 40px;text-align:center;">
          <p style="margin:0;color:#8a9ab0;font-size:12px;">${BRAND} · Costa Rica · <a href="https://crtravelservice.com" style="color:${BRAND_COLOR};text-decoration:none;">crtravelservice.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function shuttleRows(shuttles) {
  if (!shuttles || !shuttles.length) return ''
  return shuttles.map((s, i) => {
    const from = (s.departing && s.departing.name) || s.departingId || '—'
    const to = (s.destination && s.destination.name) || s.destinationId || '—'
    const date = s.date ? new Date(s.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
    return `<tr style="border-bottom:1px solid #eef1f6;">
      <td style="padding:10px 0;color:#607086;font-size:13px;">Transfer ${i + 1}</td>
      <td style="padding:10px 0;font-size:14px;font-weight:600;">${from} → ${to}</td>
      <td style="padding:10px 12px;font-size:13px;color:#607086;">${date}</td>
      <td style="padding:10px 0;font-size:13px;color:#607086;">${s.persons || 1} pax</td>
    </tr>`
  }).join('')
}

async function send(to, subject, html) {
  const transporter = createTransporter()
  if (!transporter) {
    console.log(`[Mail] SKIP — no SMTP config | to: ${to} | subject: ${subject}`)
    return
  }
  const from = settings.mailSettings.from || settings.mailSettings.user
  console.log(`[Mail] SENDING | to: ${to} | subject: ${subject} | host: ${settings.mailSettings.host}:${settings.mailSettings.port}`)
  try {
    const info = await transporter.sendMail({ from: `"${BRAND}" <${from}>`, to, subject, html })
    console.log(`[Mail] OK | to: ${to} | subject: ${subject} | messageId: ${info.messageId || '—'}`)
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
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">Verify your email</h2>
      <p style="color:#607086;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${user.name}, use the code below to complete your account registration.
      </p>
      <div style="text-align:center;margin:0 0 28px;">
        <span style="display:inline-block;background:#f4f7fb;border:2px dashed ${BRAND_COLOR};border-radius:12px;padding:18px 40px;font-size:36px;font-weight:700;letter-spacing:10px;color:#1a2636;">${code}</span>
      </div>
      <p style="color:#8a9ab0;font-size:13px;margin:0;">This code expires after 30 minutes. If you didn't request this, ignore this email.</p>
    `)
    await send(user.email, subject, html)
  },

  async guestAccountCreated(user, tempPassword) {
    const subject = `Your ${BRAND} account — set your password`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">Account created for your reservation</h2>
      <p style="color:#607086;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${user.name}, we created an account for you automatically so you can track your reservation and access your trip details.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;width:120px;">Email</td><td style="font-size:14px;font-weight:600;">${user.email}</td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Temp password</td><td style="font-size:14px;font-weight:600;letter-spacing:2px;">${tempPassword}</td></tr>
      </table>
      <p style="color:#607086;font-size:14px;line-height:1.6;margin:0 0 24px;">
        You will be asked to choose a new password when you first log in.
      </p>
      <a href="${settings.clientUrl}/login" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Log in to your account</a>
    `)
    await send(user.email, subject, html)
  },

  async welcomeCustomer(user) {
    const subject = `Welcome to ${BRAND}`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">Welcome, ${user.name}!</h2>
      <p style="color:#607086;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Your account is ready. You can now book private shuttles, track your reservations, and leave reviews from your account page.
      </p>
      <a href="${settings.clientUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Go to your account</a>
    `)
    await send(user.email, subject, html)
  },

  async reservationConfirmedCustomer(reservation, user) {
    const subject = `Reservation #${reservation.id} received — ${BRAND}`
    const shuttles = reservation.shuttles || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">Your transfer request is confirmed</h2>
      <p style="color:#607086;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Hi ${user.name}, we received your booking request. Our team will review the details and send you a final confirmation with the driver and vehicle assignment.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef1f6;border-radius:8px;border-collapse:collapse;margin-bottom:24px;">
        <thead><tr style="background:#f7f9fc;">
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;"></th>
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Route</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Date & time</th>
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Pax</th>
        </tr></thead>
        <tbody>${shuttleRows(shuttles)}</tbody>
      </table>
      ${reservation.message ? `<p style="background:#f7f9fc;border-radius:8px;padding:14px;color:#607086;font-size:14px;margin:0 0 24px;"><strong>Notes:</strong> ${reservation.message}</p>` : ''}
      <p style="color:#607086;font-size:14px;margin:0;">Questions? Reply to this email or reach us on WhatsApp.</p>
    `)
    await send(user.email, subject, html)
  },

  async reservationNotifyCompany(reservation, user) {
    const companyEmail = await getCompanyEmail()
    const subject = `New reservation #${reservation.id} — ${user.name} ${user.lastName || ''}`
    const shuttles = reservation.shuttles || []
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">New booking request</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;width:120px;">Customer</td><td style="font-size:14px;font-weight:600;">${user.name} ${user.lastName || ''}</td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Email</td><td style="font-size:14px;"><a href="mailto:${user.email}" style="color:${BRAND_COLOR};">${user.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Phone</td><td style="font-size:14px;">${user.phone || '—'}</td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eef1f6;border-radius:8px;border-collapse:collapse;margin-bottom:20px;">
        <thead><tr style="background:#f7f9fc;">
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;"></th>
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Route</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Date & time</th>
          <th style="padding:10px 0;text-align:left;font-size:12px;color:#8a9ab0;text-transform:uppercase;letter-spacing:.5px;">Pax</th>
        </tr></thead>
        <tbody>${shuttleRows(shuttles)}</tbody>
      </table>
      ${reservation.message ? `<p style="background:#f7f9fc;border-radius:8px;padding:14px;color:#607086;font-size:14px;margin:0 0 20px;"><strong>Notes:</strong> ${reservation.message}</p>` : ''}
    `)
    await send(companyEmail, subject, html)
  },

  async reviewSubmitted(testimonial, user) {
    const companyEmail = await getCompanyEmail()
    const stars = '★'.repeat(testimonial.rating || 5) + '☆'.repeat(5 - (testimonial.rating || 5))
    const subject = `New review from ${testimonial.name || user} — ${testimonial.rating}/5`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">New review submitted</h2>
      <p style="color:#f59e0b;font-size:22px;margin:0 0 12px;letter-spacing:2px;">${stars}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;width:100px;">Name</td><td style="font-size:14px;font-weight:600;">${testimonial.name}</td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Location</td><td style="font-size:14px;">${testimonial.location || '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Route</td><td style="font-size:14px;">${testimonial.route || '—'}</td></tr>
      </table>
      <blockquote style="border-left:4px solid ${BRAND_COLOR};margin:0 0 20px;padding:12px 16px;background:#f7f9fc;border-radius:0 8px 8px 0;color:#1a2636;font-size:15px;line-height:1.6;">"${testimonial.comment}"</blockquote>
      <p style="color:#607086;font-size:14px;margin:0;">Review is pending approval — activate it from the admin panel.</p>
    `)
    await send(companyEmail, subject, html)
  },

  getCompanyEmail,

  async contactMessage(message, companyEmail) {
    const subject = `New contact message from ${message.name}`
    const html = wrap(subject, `
      <h2 style="margin:0 0 8px;color:#1a2636;font-size:20px;">New contact message</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;width:100px;">Name</td><td style="font-size:14px;font-weight:600;">${message.name}</td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Email</td><td style="font-size:14px;"><a href="mailto:${message.email}" style="color:${BRAND_COLOR};">${message.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#607086;font-size:13px;">Phone</td><td style="font-size:14px;">${message.phone || '—'}</td></tr>
      </table>
      <blockquote style="border-left:4px solid ${BRAND_COLOR};margin:0;padding:12px 16px;background:#f7f9fc;border-radius:0 8px 8px 0;color:#1a2636;font-size:15px;line-height:1.6;">${message.text}</blockquote>
    `)
    await send(companyEmail, subject, html)
  }
}

module.exports = Mail
