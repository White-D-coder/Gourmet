import fs from 'fs';
import path from 'path';
import { Inquiry } from '@prisma/client';

export class EmailService {
  /**
   * Generates mock emails for corporate inquiries and writes them as local HTML files.
   * This allows immediate visual verification without configuring SMTP.
   */
  static async sendInquiryEmails(inquiry: Inquiry) {
    try {
      const emailDir = path.join(process.cwd(), 'emails');
      if (!fs.existsSync(emailDir)) {
        fs.mkdirSync(emailDir, { recursive: true });
      }

      const budgetVal = inquiry.budget 
        ? (parseInt(inquiry.budget) >= 50000 
            ? '$50,000+ (Enterprise Custom)' 
            : `$${parseInt(inquiry.budget).toLocaleString()}`) 
        : 'N/A';

      // 1. Customer Confirmation Email
      const customerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your GormetCo Concierge Inquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2e2520;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f2eb; border: 1px solid rgba(191, 161, 111, 0.2); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(46, 37, 32, 0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 0; background-color: #2e2520;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: 300; letter-spacing: 0.2em; color: #faf8f5; text-transform: uppercase;">
                GormetCo
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; letter-spacing: 0.3em; color: #bfa16f; text-transform: uppercase; font-weight: 600;">
                Gifting Concierge
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">
                Dear ${inquiry.contactName || 'Valued Client'},
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #5c5047;">
                Thank you for contacting the GormetCo Curation team. We are pleased to confirm that we have received your inquiry for custom gifting and bulk curations. A dedicated Concierge Representative is currently reviewing your request.
              </p>
              
              <div style="margin: 30px 0; padding: 25px; background-color: #faf8f5; border: 1px solid rgba(191, 161, 111, 0.15); border-radius: 8px;">
                <h3 style="margin-top: 0; font-family: Georgia, serif; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #bfa16f; border-bottom: 1px solid rgba(191, 161, 111, 0.15); padding-bottom: 8px;">
                  Inquiry Specifications
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
                  <tr>
                    <td width="35%" style="color: #7a6e64; font-weight: 600;">Organization:</td>
                    <td style="color: #2e2520;">${inquiry.companyName}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Occasion / Theme:</td>
                    <td style="color: #2e2520;">${inquiry.occasion || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Target Quantity:</td>
                    <td style="color: #2e2520;">${inquiry.quantityRange || 'N/A'} items</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Project Budget:</td>
                    <td style="color: #2e2520;">${budgetVal}</td>
                  </tr>
                  ${inquiry.requirements ? `
                  <tr>
                    <td valign="top" style="color: #7a6e64; font-weight: 600; padding-top: 5px;">Requirements:</td>
                    <td style="color: #5c5047; padding-top: 5px; white-space: pre-wrap;">"${inquiry.requirements}"</td>
                  </tr>` : ''}
                </table>
              </div>
              
              <p style="font-size: 15px; line-height: 1.7; color: #5c5047;">
                Our curators will configure digital mockup concepts and prepare a preliminary design proposal matching your brand aesthetic. We will reach out to you at this email address within 4 hours.
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #5c5047; margin-bottom: 0;">
                Sincerely,<br>
                <strong>The GormetCo Concierge Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 25px 50px; background-color: #faf8f5; border-top: 1px solid rgba(191, 161, 111, 0.15); font-size: 11px; color: #7a6e64; letter-spacing: 0.05em;">
              © ${new Date().getFullYear()} GormetCo. All rights reserved. Confidential Client Communication.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // 2. Admin Notification Email
      const adminHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>[GormetCo Ops] New Corporate Gifting Lead</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2e2520;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f2eb; border: 1px solid rgba(191, 161, 111, 0.2); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(46, 37, 32, 0.05);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px 0; background-color: #bfa16f;">
              <h1 style="margin: 0; font-family: Georgia, serif; font-size: 20px; font-weight: 300; letter-spacing: 0.15em; color: #faf8f5; text-transform: uppercase;">
                Concierge Notification
              </h1>
              <p style="margin: 5px 0 0 0; font-size: 9px; letter-spacing: 0.2em; color: #2e2520; text-transform: uppercase; font-weight: 600;">
                New Corporate Pipeline Lead
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px;">
              <p style="font-size: 16px; line-height: 1.6; margin-top: 0; font-weight: 600;">
                A new corporate/bulk curation inquiry has been received:
              </p>
              
              <div style="margin: 20px 0; padding: 20px; background-color: #faf8f5; border: 1px solid rgba(191, 161, 111, 0.15); border-radius: 8px;">
                <h3 style="margin-top: 0; font-family: Georgia, serif; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #2e2520; border-bottom: 1px solid rgba(191, 161, 111, 0.15); padding-bottom: 8px;">
                  Lead Specifications
                </h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.8;">
                  <tr>
                    <td width="35%" style="color: #7a6e64; font-weight: 600;">Company / Org:</td>
                    <td style="color: #2e2520; font-weight: 600;">${inquiry.companyName}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Contact Name:</td>
                    <td style="color: #2e2520;">${inquiry.contactName}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Email Address:</td>
                    <td style="color: #2e2520;"><a href="mailto:${inquiry.email}" style="color: #bfa16f; text-decoration: none;">${inquiry.email}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Phone Number:</td>
                    <td style="color: #2e2520;">${inquiry.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Occasion / Theme:</td>
                    <td style="color: #2e2520;">${inquiry.occasion || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Expected Qty:</td>
                    <td style="color: #2e2520;">${inquiry.quantityRange || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="color: #7a6e64; font-weight: 600;">Est. Budget:</td>
                    <td style="color: #2e2520; font-weight: 600; color: #bfa16f;">${budgetVal}</td>
                  </tr>
                  ${inquiry.requirements ? `
                  <tr>
                    <td valign="top" style="color: #7a6e64; font-weight: 600; padding-top: 5px;">Requirements:</td>
                    <td style="color: #2e2520; padding-top: 5px; white-space: pre-wrap; font-size: 13px;">${inquiry.requirements}</td>
                  </tr>` : ''}
                </table>
              </div>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px; text-align: center;">
                <tr>
                  <td>
                    <a href="http://localhost:3005/admin" target="_blank" style="background-color: #2e2520; color: #faf8f5; padding: 14px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;">
                      Open Operations Panel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #faf8f5; border-top: 1px solid rgba(191, 161, 111, 0.15); font-size: 11px; color: #7a6e64;">
              Internal Operations Log Alert. Do not forward to external parties.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const customerFilePath = path.join(emailDir, `inquiry_${inquiry.id}_customer.html`);
      const adminFilePath = path.join(emailDir, `inquiry_${inquiry.id}_admin.html`);

      fs.writeFileSync(customerFilePath, customerHtml, 'utf8');
      fs.writeFileSync(adminFilePath, adminHtml, 'utf8');

      // Clean, elegant console logging blocks
      console.log('\n=========================================');
      console.log('      GORMETCO INTERNAL MAIL ENGINE      ');
      console.log('=========================================');
      console.log(`[OUTBOUND] Confirmation sent to: ${inquiry.email}`);
      console.log(`[OUTBOUND] Operations Alert sent to: concierge@gormetco.com`);
      console.log(`[STORAGE] Saved Visual Customer Email: emails/inquiry_${inquiry.id}_customer.html`);
      console.log(`[STORAGE] Saved Visual Operations Email: emails/inquiry_${inquiry.id}_admin.html`);
      console.log('=========================================\n');
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to mock send corporate inquiry emails:', error);
    }
  }
}
