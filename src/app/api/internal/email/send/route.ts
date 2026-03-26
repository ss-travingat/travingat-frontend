import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buildEmailTemplate } from '@/lib/email/templates';

export const runtime = 'nodejs';

type SendEmailRequest = {
	type?: 'otp' | 'magic_link';
	to_email?: string;
	otp_code?: string;
	verify_url?: string;
};

const INTERNAL_SECRET = process.env.INTERNAL_EMAIL_API_SECRET || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number.parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Travingat <noreply@app.travingat.com>';

export async function POST(req: NextRequest) {
	if (!INTERNAL_SECRET) {
		return NextResponse.json({ error: 'email service not configured' }, { status: 500 });
	}

	const incomingSecret = req.headers.get('x-internal-email-secret') || '';
	if (incomingSecret !== INTERNAL_SECRET) {
		return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
	}

	let body: SendEmailRequest;
	try {
		body = (await req.json()) as SendEmailRequest;
	} catch {
		return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
	}

	const type = body.type;
	const toEmail = (body.to_email || '').trim().toLowerCase();
	if (!type || !toEmail) {
		return NextResponse.json({ error: 'type and to_email are required' }, { status: 400 });
	}

	const isMagicLink = type === 'magic_link';
	if (type !== 'otp' && !isMagicLink) {
		return NextResponse.json({ error: 'unsupported email type' }, { status: 400 });
	}

	const template = type === 'otp'
		? buildEmailTemplate({ type: 'otp', otpCode: (body.otp_code || '').trim() })
		: buildEmailTemplate({ type: 'magic_link', verifyUrl: (body.verify_url || '').trim() });

	if (type === 'otp' && (body.otp_code || '').trim().length !== 5) {
		return NextResponse.json({ error: 'otp_code must be a 5-digit string' }, { status: 400 });
	}
	if (isMagicLink && !(body.verify_url || '').trim()) {
		return NextResponse.json({ error: 'verify_url is required for magic_link' }, { status: 400 });
	}

	try {
		await sendEmailWithSMTP(toEmail, template.subject, template.html);
		return NextResponse.json({ ok: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'failed to send email';
		return NextResponse.json({ error: message }, { status: 502 });
	}
}

async function sendEmailWithSMTP(toEmail: string, subject: string, html: string) {
	if (!SMTP_USER || !SMTP_PASS) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn('SMTP_USER or SMTP_PASS is not set. Skipping email send in non-production environment.');
			return;
		}
		throw new Error('SMTP credentials are not configured');
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: SMTP_PORT === 465,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	await transporter.sendMail({
		from: EMAIL_FROM,
		to: toEmail,
		subject,
		html,
	});
}
