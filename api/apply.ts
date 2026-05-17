import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'ignitefindyourfire@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL = 'Ignite <ignitefindyourfire@gmail.com>';
const ADMIN_EMAIL = 'ignitefindyourfire@gmail.com';

function confirmationHtml(name: string, type: 'student' | 'mentor'): string {
  const role = type === 'student' ? 'student' : 'mentor';
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#FFF8F0;border-radius:16px;overflow:hidden;">
      <div style="background:#F07B2A;padding:32px 40px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;">Ignite</h1>
      </div>
      <div style="padding:40px;">
        <h2 style="color:#1A1A2E;margin-top:0;">Hey ${name}, we got your application!</h2>
        <p style="color:#4A4A5E;font-size:16px;line-height:1.6;">
          Thanks for applying to Ignite as a <strong>${role}</strong>. We're excited to have you interested in the program!
        </p>
        <p style="color:#4A4A5E;font-size:16px;line-height:1.6;">
          Here's what happens next:
        </p>
        <ol style="color:#4A4A5E;font-size:16px;line-height:2;">
          <li>We'll review your application within a few days.</li>
          <li>You'll receive a follow-up email with Zoom details and the program schedule.</li>
          <li>All applicants are welcome — so get ready to find your fire!</li>
        </ol>
        <p style="color:#4A4A5E;font-size:16px;line-height:1.6;">
          Questions? Reply to this email or reach us at
          <a href="mailto:${ADMIN_EMAIL}" style="color:#F07B2A;">${ADMIN_EMAIL}</a>.
        </p>
        <p style="color:#4A4A5E;font-size:16px;margin-bottom:0;">
          See you this summer,<br/>
          <strong style="color:#F07B2A;">The Ignite Team</strong>
        </p>
      </div>
    </div>
  `;
}

function adminNotificationHtml(data: Record<string, string>): string {
  const rows = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#1A1A2E;white-space:nowrap;background:#FFF8F0;">${k}</td>
        <td style="padding:8px 12px;color:#4A4A5E;">${v}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#F07B2A;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:22px;">New ${data['Type']} Application</h1>
      </div>
      <div style="padding:32px;background:#fff;">
        <table style="width:100%;border-collapse:collapse;border:1px solid #FFE0C8;border-radius:8px;overflow:hidden;">
          ${rows}
        </table>
        <p style="color:#4A4A5E;font-size:13px;margin-top:24px;">
          View all applications in your
          <a href="https://supabase.com/dashboard" style="color:#F07B2A;">Supabase dashboard</a>.
        </p>
      </div>
    </div>
  `;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as Record<string, string>;
  const { type, name, grade, school, email, availability, parentName, parentEmail, careerInterest, careerField, whyMentor, wishKnew } = body;

  if (!type || !name || !grade || !school || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['student', 'mentor'].includes(type)) {
    return res.status(400).json({ error: 'Invalid application type' });
  }

  // Save to Supabase
  const { error: dbError } = await supabase.from('applications').insert({
    type,
    name,
    grade,
    school,
    email,
    availability: availability || null,
    parent_name: parentName || null,
    parent_email: parentEmail || null,
    career_interest: careerInterest || null,
    career_field: careerField || null,
    why_mentor: whyMentor || null,
    wish_knew: wishKnew || null,
  });

  if (dbError) {
    console.error('Supabase insert error:', dbError);
    return res.status(500).json({ error: 'Failed to save application. Please try again.' });
  }

  // Build admin notification data table
  const adminData: Record<string, string> = {
    'Type': type.charAt(0).toUpperCase() + type.slice(1),
    'Name': name,
    'Grade': grade,
    'School': school,
    'Email': email,
    ...(availability ? { 'Availability': availability } : {}),
    ...(parentName ? { 'Parent Name': parentName } : {}),
    ...(parentEmail ? { 'Parent Email': parentEmail } : {}),
    ...(careerInterest ? { 'Career Interest': careerInterest } : {}),
    ...(careerField ? { 'Career Field': careerField } : {}),
    ...(whyMentor ? { 'Why Mentor': whyMentor } : {}),
    ...(wishKnew ? { 'Wish I Knew': wishKnew } : {}),
    'Submitted': new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
  };

  // Send emails — don't fail the request if email errors occur
  await Promise.allSettled([
    transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Ignite ${type === 'student' ? 'Student' : 'Mentor'} Application — We Got It!`,
      html: confirmationHtml(name, type as 'student' | 'mentor'),
    }),
    transporter.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New ${type} application: ${name}`,
      html: adminNotificationHtml(adminData),
    }),
  ]);

  return res.status(200).json({ success: true });
}
