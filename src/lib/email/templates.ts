export type EmailTemplateInput =
	| {
		type: 'otp';
		otpCode: string;
	}
	| {
		type: 'magic_link';
		verifyUrl: string;
	};

export type EmailTemplateOutput = {
	subject: string;
	html: string;
};

export function buildEmailTemplate(input: EmailTemplateInput): EmailTemplateOutput {
	if (input.type === 'otp') {
		return {
			subject: 'Your Travingat verification code',
			html: buildOTPEmailHTML(input.otpCode),
		};
	}

	return {
		subject: 'Verify your Travingat account',
		html: buildMagicLinkEmailHTML(input.verifyUrl),
	};
}

function buildOTPEmailHTML(code: string): string {
	return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="440" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;padding:48px 36px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="color:#fff;font-size:24px;font-weight:600;">travingat</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <span style="color:#fff;font-size:28px;font-weight:600;">Your verification code</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="color:#9ca3af;font-size:14px;">Enter this code to sign in to Travingat</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="color:#fff;font-size:48px;font-weight:700;letter-spacing:12px;">${escapeHTML(code)}</span>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="color:#6b7280;font-size:12px;">This code expires in 5 minutes. If you did not request this, ignore this email.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildMagicLinkEmailHTML(verifyUrl: string): string {
	const safeUrl = escapeHTML(verifyUrl);
	return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="440" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:16px;padding:48px 36px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="color:#fff;font-size:24px;font-weight:600;">travingat</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:12px;">
              <span style="color:#fff;font-size:28px;font-weight:600;">Verify your email</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="color:#9ca3af;font-size:14px;">Click below to verify your email and finish creating your Travingat account.</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="${safeUrl}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-weight:600;padding:14px 20px;border-radius:10px;">Verify Email</a>
            </td>
          </tr>
          <tr>
            <td align="center">
              <span style="color:#6b7280;font-size:12px;word-break:break-all;">If the button does not work, open this link:<br/>${safeUrl}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHTML(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
