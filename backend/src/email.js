// import nodemailer from 'nodemailer';
// import { promises as dns } from 'dns';

// const APP_URL = process.env.FRONTEND_URL ;

// /* ── Resolve smtp.gmail.com to IPv4 — bypasses Render IPv6 routing ─────── */
// async function resolveIPv4(hostname) {
//   try {
//     const addresses = await dns.resolve4(hostname);
//     console.log(`Resolved ${hostname} → ${addresses[0]} (IPv4)`);
//     return addresses[0];
//   } catch (err) {
//     console.warn(`IPv4 resolve failed for ${hostname}, using hostname directly`);
//     return hostname;
//   }
// }

// /* ── Build transporter lazily with forced IPv4 ──────────────────────────── */
// async function getTransporter() {
//   const user = process.env.EMAIL_USER;
//   const pass = process.env.EMAIL_PASS;

//   if (!user || !pass) {
//     throw new Error('Email credentials missing. Set EMAIL_USER and EMAIL_PASS in .env');
//   }

//   const hostname = process.env.EMAIL_HOST || 'smtp.gmail.com';
//   const port     = parseInt(process.env.EMAIL_PORT || '465');
//   const secure   = process.env.EMAIL_SECURE !== 'false';

//   /* Resolve to IPv4 directly — family:4 option is unreliable on Render */
//   const ip = await resolveIPv4(hostname);

//   return nodemailer.createTransport({
//     host: ip,               // direct IPv4 address
//     port,
//     secure,
//     auth: { user, pass },
//     tls: {
//       rejectUnauthorized: false,
//       servername: hostname, // hostname for TLS cert check
//     },
//     connectionTimeout: 15000,
//     greetingTimeout:   15000,
//     socketTimeout:     20000,
//   });
// }

// const FROM = () =>
//   process.env.EMAIL_FROM ||
//   `"GreenHub Platform" <${process.env.EMAIL_USER}>`;

// /* ── Safe send — full error log, never crashes the server ──────────────── */
// async function safeSend(mailOptions) {
//   try {
//     const transporter = await getTransporter();
//     await transporter.verify();
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✉️  Email sent → ${mailOptions.to} | id: ${info.messageId}`);
//     return info;
//   } catch (err) {
//     console.error('━━━ EMAIL SEND FAILED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.error('To      :', mailOptions.to);
//     console.error('Subject :', mailOptions.subject);
//     console.error('Error   :', err.message);
//     if (err.code) console.error('Code    :', err.code);
//     console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     throw err;
//   }
// }

/* ── Shared HTML email template ─────────────────────────────────────────── */
// function baseTemplate(title, bodyHtml) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1.0" />
//   <style>
//     body{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0}
//     .wrap{max-width:580px;margin:0 auto;padding:40px 20px}
//     .card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px}
//     .logo{text-align:center;margin-bottom:24px}
//     .logo-icon{font-size:2.5rem}
//     .logo-name{font-size:1.3rem;font-weight:700;color:#4ade80;margin-top:6px}
//     h1{font-size:1.4rem;font-weight:800;margin:0 0 8px}
//     p{color:#8b949e;line-height:1.6;margin:8px 0;font-size:.95rem}
//     .dr{display:flex;justify-content:space-between;padding:8px 12px;background:#21262d;border-radius:6px;margin:6px 0;font-size:.88rem}
//     .dk{color:#8b949e} .dv{font-weight:600;color:#e6edf3}
//     .bg{display:inline-block;padding:4px 14px;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .br{display:inline-block;padding:4px 14px;background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .bb{display:inline-block;padding:4px 14px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#059669,#4ade80);color:#000;border-radius:8px;font-weight:700;text-decoration:none;font-size:.95rem;margin-top:20px}
//     .footer{text-align:center;margin-top:28px;color:#484f58;font-size:.78rem}
//     hr{border:none;border-top:1px solid #30363d;margin:24px 0}
//     .reply-box{padding:16px;background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:8px;margin:16px 0}
//     .warn-box{padding:12px 16px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:8px;margin:12px 0}
//   </style>
// </head>
// <body>
//   <div class="wrap">
//     <div class="card">
//       <div class="logo">
//         <div class="logo-icon">⚡</div>
//         <div class="logo-name">GreenHub</div>
//       </div>
//       <h1>${title}</h1>
//       ${bodyHtml}
//       <hr/>
//       <div style="text-align:center"><a href="${APP_URL}" class="btn">Visit GreenHub →</a></div>
//     </div>
//     <div class="footer">© 2025 GreenHub — India's Renewable Energy Marketplace. This is an automated email.</div>
//   </div>
// </body>
// </html>`;
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    PRODUCER: Approval / Rejection
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendProducerStatusEmail(producer, status, adminNote = '') {
//   if (!producer.email) {
//     console.warn('sendProducerStatusEmail: producer has no email, skipping.');
//     return;
//   }
//   const approved = status === 'approved';
//   const subject  = approved
//     ? `✅ Your Energy Listing "${producer.name}" Has Been Approved — GreenHub`
//     : `❌ Your Energy Listing "${producer.name}" Was Not Approved — GreenHub`;

//   const body = `
//     <p>Dear <strong>${producer.ownerName || 'Producer'}</strong>,</p>
//     <p>Your producer listing has been reviewed by our admin team.</p>
//     <p style="margin:16px 0">Status: <span class="${approved ? 'bg' : 'br'}">${approved ? '✅ APPROVED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Listing Name</span><span class="dv">${producer.name}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${producer.type}</span></div>
//       <div class="dr"><span class="dk">Location</span><span class="dv">${producer.location}</span></div>
//       <div class="dr"><span class="dk">Capacity</span><span class="dv">${producer.capacity} ${producer.capacityUnit}</span></div>
//       <div class="dr"><span class="dk">Price</span><span class="dv">₹${producer.price}/kWh</span></div>
//     </div>
//     ${adminNote ? `<div class="warn-box"><strong style="color:#fbbf24">📋 Admin Note:</strong><br/><span style="color:#8b949e;font-size:.9rem">${adminNote}</span></div>` : ''}
//     ${approved
//       ? `<p>Your listing is now <strong style="color:#4ade80">live on the Marketplace</strong>. Buyers can now find and contact you directly!</p>`
//       : `<p>Your listing did not meet our requirements. Please review the note above and re-submit with corrections.</p>`
//     }`;

//   await safeSend({ from: FROM(), to: producer.email, subject, html: baseTemplate(approved ? '🎉 Listing Approved!' : 'Listing Status Update', body) });
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    BUY REQUEST: Accept / Reject
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendBuyRequestStatusEmail(buyRequest, status) {
//   if (!buyRequest.buyerEmail) {
//     console.warn('sendBuyRequestStatusEmail: no buyer email, skipping.');
//     return;
//   }
//   const accepted = status === 'accepted';
//   const subject  = accepted
//     ? `✅ Your Buy Request #${buyRequest.reqId} Has Been Accepted — GreenHub`
//     : `❌ Your Buy Request #${buyRequest.reqId} Was Rejected — GreenHub`;

//   const body = `
//     <p>Dear <strong>${buyRequest.buyerName}</strong>,</p>
//     <p>Your energy buy request has been reviewed.</p>
//     <p style="margin:16px 0">Status: <span class="${accepted ? 'bg' : 'br'}">${accepted ? '✅ ACCEPTED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Request ID</span><span class="dv">${buyRequest.reqId}</span></div>
//       <div class="dr"><span class="dk">Producer</span><span class="dv">${buyRequest.producerName}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${buyRequest.energyType}</span></div>
//       <div class="dr"><span class="dk">Amount</span><span class="dv">${buyRequest.amount} kWh</span></div>
//       <div class="dr"><span class="dk">Duration</span><span class="dv">${buyRequest.duration}</span></div>
//       <div class="dr"><span class="dk">Total Estimate</span><span class="dv">₹${buyRequest.totalEstimate}</span></div>
//     </div>
//     ${accepted
//       ? `<p>The producer has accepted your request! They will contact you at <strong>${buyRequest.buyerEmail}</strong> within 24 hours to arrange the energy supply.</p>`
//       : `<p>Unfortunately the producer could not fulfil your request at this time. Please browse other producers on the Marketplace and submit a new request.</p>`
//     }`;

//   await safeSend({ from: FROM(), to: buyRequest.buyerEmail, subject, html: baseTemplate(accepted ? '🎉 Buy Request Accepted!' : 'Buy Request Status Update', body) });
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    SUPPORT: Admin Reply
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendSupportReplyEmail(ticket, adminReply) {
//   if (!ticket.email) {
//     console.warn('sendSupportReplyEmail: no ticket email, skipping.');
//     return;
//   }
//   if (!adminReply || !adminReply.trim()) {
//     console.warn('sendSupportReplyEmail: empty reply, skipping.');
//     return;
//   }
//   const subject = `💬 Reply to Your Support Ticket ${ticket.ticketId} — GreenHub`;

//   const body = `
//     <p>Dear <strong>${ticket.name}</strong>,</p>
//     <p>Our support team has responded to your ticket.</p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Ticket ID</span><span class="dv">${ticket.ticketId}</span></div>
//       <div class="dr"><span class="dk">Category</span><span class="dv">${ticket.category}</span></div>
//       <div class="dr"><span class="dk">Subject</span><span class="dv">${ticket.subject}</span></div>
//       <div class="dr"><span class="dk">Status</span><span class="dv"><span class="bb">IN PROGRESS</span></span></div>
//     </div>
//     <div class="reply-box">
//       <strong style="color:#4ade80;font-size:.85rem">📝 Admin Reply:</strong>
//       <p style="margin:8px 0 0;color:#c9d1d9">${adminReply}</p>
//     </div>
//     <p>Your original query: <em style="color:#8b949e">"${String(ticket.message).substring(0, 200)}${ticket.message.length > 200 ? '...' : ''}"</em></p>
//     <p>For further queries, please visit our support page.</p>`;

//   await safeSend({ from: FROM(), to: ticket.email, subject, html: baseTemplate('Support Team Reply', body) });
// }









// import { Resend } from 'resend';

// const APP_URL = process.env.FRONTEND_URL ;

// function getClient() {
//   const key = process.env.RESEND_API_KEY;
//   if (!key) throw new Error('RESEND_API_KEY missing in environment variables');
//   return new Resend(key);
// }

// const FROM = () =>
//   process.env.EMAIL_FROM ;

// /* ── Safe send ──────────────────────────────────────────────────────────── */
// async function safeSend(to, subject, html) {
//   try {
//     const resend = getClient();
//     const { data, error } = await resend.emails.send({
//       from:    FROM(),
//       to:      [to],
//       subject,
//       html,
//     });
//     if (error) throw new Error(error.message);
//     console.log(`✉️  Email sent → ${to} | id: ${data.id}`);
//     return data;
//   } catch (err) {
//     console.error('━━━ EMAIL SEND FAILED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.error('To      :', to);
//     console.error('Subject :', subject);
//     console.error('Error   :', err.message);
//     console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     throw err;
//   }
// }

// /* ── Shared HTML template ───────────────────────────────────────────────── */
// function baseTemplate(title, bodyHtml) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1.0" />
//   <style>
//     body{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0}
//     .wrap{max-width:580px;margin:0 auto;padding:40px 20px}
//     .card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px}
//     .logo{text-align:center;margin-bottom:24px}
//     .logo-icon{font-size:2.5rem}
//     .logo-name{font-size:1.3rem;font-weight:700;color:#4ade80;margin-top:6px}
//     h1{font-size:1.4rem;font-weight:800;margin:0 0 8px}
//     p{color:#8b949e;line-height:1.6;margin:8px 0;font-size:.95rem}
//     .dr{display:flex;justify-content:space-between;padding:8px 12px;background:#21262d;border-radius:6px;margin:6px 0;font-size:.88rem}
//     .dk{color:#8b949e} .dv{font-weight:600;color:#e6edf3}
//     .bg{display:inline-block;padding:4px 14px;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .br{display:inline-block;padding:4px 14px;background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .bb{display:inline-block;padding:4px 14px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#059669,#4ade80);color:#000;border-radius:8px;font-weight:700;text-decoration:none;font-size:.95rem;margin-top:20px}
//     .footer{text-align:center;margin-top:28px;color:#484f58;font-size:.78rem}
//     hr{border:none;border-top:1px solid #30363d;margin:24px 0}
//     .reply-box{padding:16px;background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:8px;margin:16px 0}
//     .warn-box{padding:12px 16px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:8px;margin:12px 0}
//   </style>
// </head>
// <body>
//   <div class="wrap">
//     <div class="card">
//       <div class="logo">
//         <div class="logo-icon">⚡</div>
//         <div class="logo-name">GreenHub</div>
//       </div>
//       <h1>${title}</h1>
//       ${bodyHtml}
//       <hr/>
//       <div style="text-align:center"><a href="${APP_URL}" class="btn">Visit GreenHub →</a></div>
//     </div>
//     <div class="footer">© 2025 GreenHub — India's Renewable Energy Marketplace.</div>
//   </div>
// </body>
// </html>`;
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    PRODUCER: Approval / Rejection
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendProducerStatusEmail(producer, status, adminNote = '') {
//   if (!producer.email) return;
//   const approved = status === 'approved';
//   const subject  = approved
//     ? `✅ Your Energy Listing "${producer.name}" Has Been Approved — GreenHub`
//     : `❌ Your Energy Listing "${producer.name}" Was Not Approved — GreenHub`;

//   const body = `
//     <p>Dear <strong>${producer.ownerName || 'Producer'}</strong>,</p>
//     <p>Your producer listing has been reviewed by our admin team.</p>
//     <p style="margin:16px 0">Status: <span class="${approved ? 'bg' : 'br'}">${approved ? '✅ APPROVED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Listing Name</span><span class="dv">${producer.name}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${producer.type}</span></div>
//       <div class="dr"><span class="dk">Location</span><span class="dv">${producer.location}</span></div>
//       <div class="dr"><span class="dk">Capacity</span><span class="dv">${producer.capacity} ${producer.capacityUnit}</span></div>
//       <div class="dr"><span class="dk">Price</span><span class="dv">₹${producer.price}/kWh</span></div>
//     </div>
//     ${adminNote ? `<div class="warn-box"><strong style="color:#fbbf24">📋 Admin Note:</strong><br/><span style="color:#8b949e;font-size:.9rem">${adminNote}</span></div>` : ''}
//     ${approved
//       ? `<p>Your listing is now <strong style="color:#4ade80">live on the Marketplace</strong>. Buyers can now find and contact you directly!</p>`
//       : `<p>Your listing did not meet our requirements. Please review the note above and re-submit with corrections.</p>`
//     }`;

//   await safeSend(producer.email, subject, baseTemplate(approved ? '🎉 Listing Approved!' : 'Listing Status Update', body));
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    BUY REQUEST: Accept / Reject
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendBuyRequestStatusEmail(buyRequest, status) {
//   if (!buyRequest.buyerEmail) return;
//   const accepted = status === 'accepted';
//   const subject  = accepted
//     ? `✅ Your Buy Request #${buyRequest.reqId} Has Been Accepted — GreenHub`
//     : `❌ Your Buy Request #${buyRequest.reqId} Was Rejected — GreenHub`;

//   const body = `
//     <p>Dear <strong>${buyRequest.buyerName}</strong>,</p>
//     <p>Your energy buy request has been reviewed.</p>
//     <p style="margin:16px 0">Status: <span class="${accepted ? 'bg' : 'br'}">${accepted ? '✅ ACCEPTED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Request ID</span><span class="dv">${buyRequest.reqId}</span></div>
//       <div class="dr"><span class="dk">Producer</span><span class="dv">${buyRequest.producerName}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${buyRequest.energyType}</span></div>
//       <div class="dr"><span class="dk">Amount</span><span class="dv">${buyRequest.amount} kWh</span></div>
//       <div class="dr"><span class="dk">Duration</span><span class="dv">${buyRequest.duration}</span></div>
//       <div class="dr"><span class="dk">Total Estimate</span><span class="dv">₹${buyRequest.totalEstimate}</span></div>
//     </div>
//     ${accepted
//       ? `<p>The producer has accepted your request! They will contact you at <strong>${buyRequest.buyerEmail}</strong> within 24 hours.</p>`
//       : `<p>Unfortunately the producer could not fulfil your request. Please browse other producers on the Marketplace.</p>`
//     }`;

//   await safeSend(buyRequest.buyerEmail, subject, baseTemplate(accepted ? '🎉 Buy Request Accepted!' : 'Buy Request Status Update', body));
// }

// /* ══════════════════════════════════════════════════════════════════════════
//    SUPPORT: Admin Reply
// ══════════════════════════════════════════════════════════════════════════ */
// export async function sendSupportReplyEmail(ticket, adminReply) {
//   if (!ticket.email || !adminReply?.trim()) return;
//   const subject = `💬 Reply to Your Support Ticket ${ticket.ticketId} — GreenHub`;

//   const body = `
//     <p>Dear <strong>${ticket.name}</strong>,</p>
//     <p>Our support team has responded to your ticket.</p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Ticket ID</span><span class="dv">${ticket.ticketId}</span></div>
//       <div class="dr"><span class="dk">Category</span><span class="dv">${ticket.category}</span></div>
//       <div class="dr"><span class="dk">Subject</span><span class="dv">${ticket.subject}</span></div>
//       <div class="dr"><span class="dk">Status</span><span class="dv"><span class="bb">IN PROGRESS</span></span></div>
//     </div>
//     <div class="reply-box">
//       <strong style="color:#4ade80;font-size:.85rem">📝 Admin Reply:</strong>
//       <p style="margin:8px 0 0;color:#c9d1d9">${adminReply}</p>
//     </div>
//     <p>Your original query: <em style="color:#8b949e">"${String(ticket.message).substring(0, 200)}${ticket.message.length > 200 ? '...' : ''}"</em></p>`;

//   await safeSend(ticket.email, subject, baseTemplate('Support Team Reply', body));
// }










// import nodemailer from 'nodemailer';

// const APP_URL = process.env.FRONTEND_URL;

// function getTransporter() {
//   const user = process.env.EMAIL_USER;
//   const pass = process.env.EMAIL_PASS;
//   if (!user || !pass) throw new Error('EMAIL_USER or EMAIL_PASS missing in env');

//   return nodemailer.createTransport({
//     host:   'smtp.gmail.com',
//     port:   465,
//     secure: true,
//     auth:   { user, pass },
//     tls:    { rejectUnauthorized: false },
//   });
// }

// const FROM = () =>
//   process.env.EMAIL_FROM || `"GreenHub Platform" <${process.env.EMAIL_USER}>`;

// async function safeSend(mailOptions) {
//   try {
//     const transporter = getTransporter();
//     await transporter.verify();
//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✉️  Email sent → ${mailOptions.to} | id: ${info.messageId}`);
//     return info;
//   } catch (err) {
//     console.error('━━━ EMAIL SEND FAILED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.error('To      :', mailOptions.to);
//     console.error('Subject :', mailOptions.subject);
//     console.error('Error   :', err.message);
//     if (err.code) console.error('Code    :', err.code);
//     console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     throw err;
//   }
// }

// function baseTemplate(title, bodyHtml) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width,initial-scale=1.0" />
//   <style>
//     body{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0}
//     .wrap{max-width:580px;margin:0 auto;padding:40px 20px}
//     .card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px}
//     .logo{text-align:center;margin-bottom:24px}
//     .logo-icon{font-size:2.5rem}
//     .logo-name{font-size:1.3rem;font-weight:700;color:#4ade80;margin-top:6px}
//     h1{font-size:1.4rem;font-weight:800;margin:0 0 8px}
//     p{color:#8b949e;line-height:1.6;margin:8px 0;font-size:.95rem}
//     .dr{display:flex;justify-content:space-between;padding:8px 12px;background:#21262d;border-radius:6px;margin:6px 0;font-size:.88rem}
//     .dk{color:#8b949e} .dv{font-weight:600;color:#e6edf3}
//     .bg{display:inline-block;padding:4px 14px;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .br{display:inline-block;padding:4px 14px;background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .bb{display:inline-block;padding:4px 14px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3);border-radius:20px;font-weight:700;font-size:.85rem}
//     .btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#059669,#4ade80);color:#000;border-radius:8px;font-weight:700;text-decoration:none;font-size:.95rem;margin-top:20px}
//     .footer{text-align:center;margin-top:28px;color:#484f58;font-size:.78rem}
//     hr{border:none;border-top:1px solid #30363d;margin:24px 0}
//     .reply-box{padding:16px;background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:8px;margin:16px 0}
//     .warn-box{padding:12px 16px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:8px;margin:12px 0}
//   </style>
// </head>
// <body>
//   <div class="wrap">
//     <div class="card">
//       <div class="logo">
//         <div class="logo-icon">⚡</div>
//         <div class="logo-name">GreenHub</div>
//       </div>
//       <h1>${title}</h1>
//       ${bodyHtml}
//       <hr/>
//       <div style="text-align:center"><a href="${APP_URL}" class="btn">Visit GreenHub →</a></div>
//     </div>
//     <div class="footer">© 2025 GreenHub — India's Renewable Energy Marketplace.</div>
//   </div>
// </body>
// </html>`;
// }

// export async function sendProducerStatusEmail(producer, status, adminNote = '') {
//   if (!producer.email) return;
//   const approved = status === 'approved';
//   const subject  = approved
//     ? `✅ Your Energy Listing "${producer.name}" Has Been Approved — GreenHub`
//     : `❌ Your Energy Listing "${producer.name}" Was Not Approved — GreenHub`;

//   const body = `
//     <p>Dear <strong>${producer.ownerName || 'Producer'}</strong>,</p>
//     <p>Your producer listing has been reviewed by our admin team.</p>
//     <p style="margin:16px 0">Status: <span class="${approved ? 'bg' : 'br'}">${approved ? '✅ APPROVED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Listing Name</span><span class="dv">${producer.name}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${producer.type}</span></div>
//       <div class="dr"><span class="dk">Location</span><span class="dv">${producer.location}</span></div>
//       <div class="dr"><span class="dk">Capacity</span><span class="dv">${producer.capacity} ${producer.capacityUnit}</span></div>
//       <div class="dr"><span class="dk">Price</span><span class="dv">₹${producer.price}/kWh</span></div>
//     </div>
//     ${adminNote ? `<div class="warn-box"><strong style="color:#fbbf24">📋 Admin Note:</strong><br/><span style="color:#8b949e;font-size:.9rem">${adminNote}</span></div>` : ''}
//     ${approved
//       ? `<p>Your listing is now <strong style="color:#4ade80">live on the Marketplace</strong>. Buyers can now find and contact you directly!</p>`
//       : `<p>Your listing did not meet our requirements. Please review the note above and re-submit with corrections.</p>`
//     }`;

//   await safeSend({ from: FROM(), to: producer.email, subject, html: baseTemplate(approved ? '🎉 Listing Approved!' : 'Listing Status Update', body) });
// }

// export async function sendBuyRequestStatusEmail(buyRequest, status) {
//   if (!buyRequest.buyerEmail) return;
//   const accepted = status === 'accepted';
//   const subject  = accepted
//     ? `✅ Your Buy Request #${buyRequest.reqId} Has Been Accepted — GreenHub`
//     : `❌ Your Buy Request #${buyRequest.reqId} Was Rejected — GreenHub`;

//   const body = `
//     <p>Dear <strong>${buyRequest.buyerName}</strong>,</p>
//     <p>Your energy buy request has been reviewed.</p>
//     <p style="margin:16px 0">Status: <span class="${accepted ? 'bg' : 'br'}">${accepted ? '✅ ACCEPTED' : '❌ REJECTED'}</span></p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Request ID</span><span class="dv">${buyRequest.reqId}</span></div>
//       <div class="dr"><span class="dk">Producer</span><span class="dv">${buyRequest.producerName}</span></div>
//       <div class="dr"><span class="dk">Energy Type</span><span class="dv">${buyRequest.energyType}</span></div>
//       <div class="dr"><span class="dk">Amount</span><span class="dv">${buyRequest.amount} kWh</span></div>
//       <div class="dr"><span class="dk">Duration</span><span class="dv">${buyRequest.duration}</span></div>
//       <div class="dr"><span class="dk">Total Estimate</span><span class="dv">₹${buyRequest.totalEstimate}</span></div>
//     </div>
//     ${accepted
//       ? `<p>The producer has accepted your request! They will contact you at <strong>${buyRequest.buyerEmail}</strong> within 24 hours.</p>`
//       : `<p>Unfortunately the producer could not fulfil your request. Please browse other producers on the Marketplace.</p>`
//     }`;

//   await safeSend({ from: FROM(), to: buyRequest.buyerEmail, subject, html: baseTemplate(accepted ? '🎉 Buy Request Accepted!' : 'Buy Request Status Update', body) });
// }

// export async function sendSupportReplyEmail(ticket, adminReply) {
//   if (!ticket.email || !adminReply?.trim()) return;
//   const subject = `💬 Reply to Your Support Ticket ${ticket.ticketId} — GreenHub`;

//   const body = `
//     <p>Dear <strong>${ticket.name}</strong>,</p>
//     <p>Our support team has responded to your ticket.</p>
//     <div style="margin:16px 0">
//       <div class="dr"><span class="dk">Ticket ID</span><span class="dv">${ticket.ticketId}</span></div>
//       <div class="dr"><span class="dk">Category</span><span class="dv">${ticket.category}</span></div>
//       <div class="dr"><span class="dk">Subject</span><span class="dv">${ticket.subject}</span></div>
//       <div class="dr"><span class="dk">Status</span><span class="dv"><span class="bb">IN PROGRESS</span></span></div>
//     </div>
//     <div class="reply-box">
//       <strong style="color:#4ade80;font-size:.85rem">📝 Admin Reply:</strong>
//       <p style="margin:8px 0 0;color:#c9d1d9">${adminReply}</p>
//     </div>
//     <p>Your original query: <em style="color:#8b949e">"${String(ticket.message).substring(0, 200)}${ticket.message.length > 200 ? '...' : ''}"</em></p>`;

//   await safeSend({ from: FROM(), to: ticket.email, subject, html: baseTemplate('Support Team Reply', body) });
// }





import fetch from 'node-fetch';

const APP_URL = process.env.FRONTEND_URL;

async function safeSend(to, subject, html) {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) throw new Error('SENDGRID_API_KEY missing');

  const from  = process.env.EMAIL_FROM || 'tomarvinaysingh70@gmail.com';

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from:             { email: from, name: 'GreenHub-Platform' },
      subject,
      content:          [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('━━━ EMAIL SEND FAILED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('To      :', to);
    console.error('Subject :', subject);
    console.error('Status  :', res.status);
    console.error('Error   :', err);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw new Error(`SendGrid error: ${res.status}`);
  }

  console.log(`✉️  Email sent → ${to} | subject: ${subject}`);
}

function baseTemplate(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0}
    .wrap{max-width:580px;margin:0 auto;padding:40px 20px}
    .card{background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px}
    .logo{text-align:center;margin-bottom:24px}
    .logo-icon{font-size:2.5rem}
    .logo-name{font-size:1.3rem;font-weight:700;color:#4ade80;margin-top:6px}
    h1{font-size:1.4rem;font-weight:800;margin:0 0 8px}
    p{color:#8b949e;line-height:1.6;margin:8px 0;font-size:.95rem}
    .dr{display:flex;justify-content:space-between;padding:8px 12px;background:#21262d;border-radius:6px;margin:6px 0;font-size:.88rem}
    .dk{color:#8b949e} .dv{font-weight:600;color:#e6edf3}
    .bg{display:inline-block;padding:4px 14px;background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3);border-radius:20px;font-weight:700;font-size:.85rem}
    .br{display:inline-block;padding:4px 14px;background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);border-radius:20px;font-weight:700;font-size:.85rem}
    .bb{display:inline-block;padding:4px 14px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3);border-radius:20px;font-weight:700;font-size:.85rem}
    .btn{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#059669,#4ade80);color:#000;border-radius:8px;font-weight:700;text-decoration:none;font-size:.95rem;margin-top:20px}
    .footer{text-align:center;margin-top:28px;color:#484f58;font-size:.78rem}
    hr{border:none;border-top:1px solid #30363d;margin:24px 0}
    .reply-box{padding:16px;background:rgba(74,222,128,.07);border:1px solid rgba(74,222,128,.2);border-radius:8px;margin:16px 0}
    .warn-box{padding:12px 16px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:8px;margin:12px 0}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-name">GreenHub</div>
      </div>
      <h1>${title}</h1>
      ${bodyHtml}
      <hr/>
      <div style="text-align:center"><a href="${APP_URL}" class="btn">Visit GreenHub →</a></div>
    </div>
    <div class="footer">© 2025 GreenHub — India's Renewable Energy Marketplace.</div>
  </div>
</body>
</html>`;
}

export async function sendProducerStatusEmail(producer, status, adminNote = '') {
  if (!producer.email) return;
  const approved = status === 'approved';
  const subject  = approved
    ? `✅ Your Energy Listing "${producer.name}" Has Been Approved — GreenHub`
    : `❌ Your Energy Listing "${producer.name}" Was Not Approved — GreenHub`;

  const body = `
    <p>Dear <strong>${producer.ownerName || 'Producer'}</strong>,</p>
    <p>Your producer listing has been reviewed by our admin team.</p>
    <p style="margin:16px 0">Status: <span class="${approved ? 'bg' : 'br'}">${approved ? '✅ APPROVED' : '❌ REJECTED'}</span></p>
    <div style="margin:16px 0">
      <div class="dr"><span class="dk">Listing Name</span><span class="dv">${producer.name}</span></div>
      <div class="dr"><span class="dk">Energy Type</span><span class="dv">${producer.type}</span></div>
      <div class="dr"><span class="dk">Location</span><span class="dv">${producer.location}</span></div>
      <div class="dr"><span class="dk">Capacity</span><span class="dv">${producer.capacity} ${producer.capacityUnit}</span></div>
      <div class="dr"><span class="dk">Price</span><span class="dv">₹${producer.price}/kWh</span></div>
    </div>
    ${adminNote ? `<div class="warn-box"><strong style="color:#fbbf24">📋 Admin Note:</strong><br/><span style="color:#8b949e;font-size:.9rem">${adminNote}</span></div>` : ''}
    ${approved
      ? `<p>Your listing is now <strong style="color:#4ade80">live on the Marketplace</strong>. Buyers can now find and contact you directly!</p>`
      : `<p>Your listing did not meet our requirements. Please review the note above and re-submit with corrections.</p>`
    }`;

  await safeSend(producer.email, subject, baseTemplate(approved ? '🎉 Listing Approved!' : 'Listing Status Update', body));
}

export async function sendBuyRequestStatusEmail(buyRequest, status) {
  if (!buyRequest.buyerEmail) return;
  const accepted = status === 'accepted';
  const subject  = accepted
    ? `✅ Your Buy Request #${buyRequest.reqId} Has Been Accepted — GreenHub`
    : `❌ Your Buy Request #${buyRequest.reqId} Was Rejected — GreenHub`;

  const body = `
    <p>Dear <strong>${buyRequest.buyerName}</strong>,</p>
    <p>Your energy buy request has been reviewed.</p>
    <p style="margin:16px 0">Status: <span class="${accepted ? 'bg' : 'br'}">${accepted ? '✅ ACCEPTED' : '❌ REJECTED'}</span></p>
    <div style="margin:16px 0">
      <div class="dr"><span class="dk">Request ID</span><span class="dv">${buyRequest.reqId}</span></div>
      <div class="dr"><span class="dk">Producer</span><span class="dv">${buyRequest.producerName}</span></div>
      <div class="dr"><span class="dk">Energy Type</span><span class="dv">${buyRequest.energyType}</span></div>
      <div class="dr"><span class="dk">Amount</span><span class="dv">${buyRequest.amount} kWh</span></div>
      <div class="dr"><span class="dk">Duration</span><span class="dv">${buyRequest.duration}</span></div>
      <div class="dr"><span class="dk">Total Estimate</span><span class="dv">₹${buyRequest.totalEstimate}</span></div>
    </div>
    ${accepted
      ? `<p>The producer has accepted your request! They will contact you at <strong>${buyRequest.buyerEmail}</strong> within 24 hours.</p>`
      : `<p>Unfortunately the producer could not fulfil your request. Please browse other producers on the Marketplace.</p>`
    }`;

  await safeSend(buyRequest.buyerEmail, subject, baseTemplate(accepted ? '🎉 Buy Request Accepted!' : 'Buy Request Status Update', body));
}

export async function sendSupportReplyEmail(ticket, adminReply) {
  if (!ticket.email || !adminReply?.trim()) return;
  const subject = `💬 Reply to Your Support Ticket ${ticket.ticketId} — GreenHub`;

  const body = `
    <p>Dear <strong>${ticket.name}</strong>,</p>
    <p>Our support team has responded to your ticket.</p>
    <div style="margin:16px 0">
      <div class="dr"><span class="dk">Ticket ID</span><span class="dv">${ticket.ticketId}</span></div>
      <div class="dr"><span class="dk">Category</span><span class="dv">${ticket.category}</span></div>
      <div class="dr"><span class="dk">Subject</span><span class="dv">${ticket.subject}</span></div>
      <div class="dr"><span class="dk">Status</span><span class="dv"><span class="bb">IN PROGRESS</span></span></div>
    </div>
    <div class="reply-box">
      <strong style="color:#4ade80;font-size:.85rem">📝 Admin Reply:</strong>
      <p style="margin:8px 0 0;color:#c9d1d9">${adminReply}</p>
    </div>
    <p>Your original query: <em style="color:#8b949e">"${String(ticket.message).substring(0, 200)}${ticket.message.length > 200 ? '...' : ''}"</em></p>`;

  await safeSend(ticket.email, subject, baseTemplate('Support Team Reply', body));
}