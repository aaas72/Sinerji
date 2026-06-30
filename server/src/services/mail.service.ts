import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private logFilePath = path.join(__dirname, '../../../email_debug.log');

  constructor() {
    this.initializeTransporter();
  }

  private writeDebugLog(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    try {
      fs.appendFileSync(this.logFilePath, logLine, 'utf8');
    } catch (err) {
      console.error('Failed to write to email debug log file:', err);
    }
  }

  private async initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.writeDebugLog('--- Initializing Mail Service Transporter ---');
    this.writeDebugLog(`SMTP Settings - Host: ${host || 'NOT SET'}, Port: ${port}, User: ${user || 'NOT SET'}, Pass: ${pass ? '***PROVIDED***' : 'NOT SET'}`);

    if (!host || !user || !pass || pass === 'Buraya_Uygulama_Sifresi_Girin') {
      this.writeDebugLog('STATUS: SMTP credentials not fully configured or placeholder password detected. Falling back to Dev Mock Mode.');
      logger.warn('[MailService] SMTP credentials not fully configured in env. Fallback to Dev Mock Mode.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      this.writeDebugLog('Verifying SMTP connection...');
      await this.transporter.verify();
      this.writeDebugLog('STATUS: SMTP Transporter verified and connected successfully.');
      logger.info('[MailService] SMTP Transporter verified successfully.');
    } catch (error: any) {
      this.writeDebugLog(`ERROR during SMTP verification: ${error.message || error}`);
      logger.error('[MailService] Error verifying SMTP transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Sends the university email verification code to the student.
   * @param to Student university email (.edu.tr)
   * @param code 6-digit verification code
   * @param studentName Student full name
   */
  async sendVerificationCode(to: string, code: string, studentName: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || `"Sinerji" <${process.env.SMTP_USER}>`;
    const subject = 'Sinerji - Üniversite E-posta Doğrulama Kodu';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sinerji - E-posta Doğrulama</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Outfit:wght@600;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            background-color: #f6f5f0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            width: 100%;
            background-color: #f6f5f0;
            padding-bottom: 50px;
          }
          .header-bg {
            background-color: #00342b;
            height: 140px;
            text-align: center;
          }
          .header-title {
            color: #ffffff;
            font-family: 'Outfit', sans-serif;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0;
            padding-top: 40px;
            text-transform: uppercase;
          }
          .card-container {
            max-width: 540px;
            margin: -40px auto 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid rgba(223, 222, 214, 0.8);
            box-shadow: 0 20px 40px -10px rgba(0, 77, 64, 0.06);
            padding: 40px;
            text-align: center;
          }
          .badge-container {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: rgba(148, 211, 193, 0.15);
            border: 1px solid rgba(148, 211, 193, 0.3);
            margin: 0 auto 24px auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .badge-icon {
            color: #004d40;
            font-size: 30px;
            line-height: 1;
            font-weight: bold;
          }
          .badge-sub {
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            font-weight: 700;
            color: #735c00;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
          }
          .headline {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 700;
            color: #00342b;
            margin: 0 0 16px 0;
            letter-spacing: -0.01em;
          }
          .intro-text {
            font-size: 14px;
            line-height: 22px;
            color: #707975;
            max-width: 400px;
            margin: 0 auto 32px auto;
          }
          .otp-box {
            background-color: rgba(240, 244, 243, 0.85);
            border: 1px solid rgba(212, 175, 55, 0.45);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .otp-label {
            font-size: 11px;
            font-weight: 700;
            color: #707975;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 12px;
            display: block;
          }
          .otp-code {
            font-family: 'Outfit', sans-serif;
            font-size: 42px;
            font-weight: 700;
            color: #00342b;
            letter-spacing: 0.25em;
            margin: 0 0 12px 0;
            padding-left: 0.25em; /* balancing center letter-spacing offset */
          }
          .expiry-text {
            font-size: 11px;
            color: #707975;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          .cta-btn {
            display: inline-block;
            background-color: #00342b;
            color: #ffffff !important;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 10px 20px rgba(0, 52, 43, 0.15);
            transition: background-color 0.2s;
          }
          .security-link {
            font-size: 11px;
            color: #707975;
            text-decoration: none;
            border-bottom: 1px solid transparent;
          }
          .security-link:hover {
            color: #00342b;
            border-bottom-color: #00342b;
          }
          .divider {
            height: 1px;
            background-color: rgba(212, 175, 55, 0.2);
            margin: 32px 0;
          }
          .footer {
            max-width: 540px;
            margin: 0 auto;
            padding-top: 32px;
            text-align: center;
          }
          .footer-title {
            font-size: 11px;
            font-weight: 700;
            color: #707975;
            letter-spacing: 0.15em;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .footer-text {
            font-size: 12px;
            color: #707975;
            line-height: 18px;
            margin: 0 0 16px 0;
          }
          .footer-links a {
            font-size: 11px;
            color: #707975;
            text-decoration: none;
            margin: 0 10px;
          }
          .footer-links a:hover {
            color: #00342b;
          }
          .encrypted-badge {
            margin-top: 24px;
            font-size: 9px;
            font-weight: 700;
            color: #bfc9c4;
            letter-spacing: 0.1em;
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background-color:#f6f5f0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f5f0;">
          <tr>
            <td align="center" style="padding-bottom:50px;">

              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#00342b;">
                <tr>
                  <td align="center" style="padding:14px 0;">
                    <h1 style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.05em;margin:0;text-transform:uppercase;">Sinerji</h1>
                  </td>
                </tr>
              </table>

              <!-- Card -->
              <table width="540" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:540px;width:100%;background:#ffffff;border-radius:16px;border:1px solid rgba(223,222,214,0.8);box-shadow:0 20px 40px -10px rgba(0,77,64,0.06);margin-top:-40px;">
                <tr>
                  <td align="center" style="padding:40px;">

                    <!-- Badge -->
                    <div style="width:64px;height:64px;border-radius:50%;background-color:rgba(148,211,193,0.15);border:1px solid rgba(148,211,193,0.3);margin:0 auto 24px auto;text-align:center;line-height:64px;">
                      <span style="color:#004d40;font-size:30px;font-weight:bold;line-height:64px;">✓</span>
                    </div>

                    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:#735c00;letter-spacing:0.15em;text-transform:uppercase;display:block;margin-bottom:8px;">Security Verification</span>
                    <h2 style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:700;color:#00342b;margin:0 0 16px 0;letter-spacing:-0.01em;">Identity Confirmation</h2>
                    <p style="font-size:14px;line-height:22px;color:#707975;max-width:400px;margin:0 auto 32px auto;text-align:center;">
                      Merhaba <strong>${studentName}</strong>,<br><br>
                      Sinerji üniversite portalı çift aşamalı öğrenci kimlik doğrulama işlemini tamamlamak için lütfen aşağıdaki tek kullanımlık güvenlik kodunu kullanın.
                    </p>

                    <!-- OTP Box -->
                    <div style="padding:20px 0 28px 0;text-align:center;">
                      <span style="font-size:11px;font-weight:700;color:#707975;letter-spacing:0.1em;text-transform:uppercase;display:block;margin-bottom:12px;">Doğrulama Kodunuz</span>
                      <div style="font-family:'Outfit',sans-serif;font-size:42px;font-weight:700;color:#00342b;letter-spacing:0.25em;margin:0 0 10px 0;">${code}</div>
                      <div style="font-size:11px;color:#707975;text-align:center;">⏱ Geçerlilik süresi: 2 dakikadır</div>
                    </div>

                    <!-- CTA Button -->
                    <div style="margin-top:24px;margin-bottom:20px;">
                      <a href="http://localhost:3000/student/settings" style="display:inline-block;background-color:#00342b;color:#ffffff;font-family:'Inter',sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:12px;box-shadow:0 10px 20px rgba(0,52,43,0.15);">Portala Devam Et</a>
                    </div>



                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table width="540" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:540px;width:100%;padding-top:32px;">
                <tr>
                  <td align="center">
                    <div style="font-size:11px;font-weight:700;color:#707975;letter-spacing:0.15em;margin-bottom:12px;text-transform:uppercase;">SINERJI UNIVERSITY</div>
                    <p style="font-size:12px;color:#707975;line-height:18px;margin:0 0 16px 0;">© 2026 Sinerji University Verification Portal. All rights reserved.</p>
                    <div>
                      <a href="#" style="font-size:11px;color:#707975;text-decoration:none;margin:0 10px;">Gizlilik Politikası</a>
                      <a href="#" style="font-size:11px;color:#707975;text-decoration:none;margin:0 10px;">Destek Talebi</a>
                      <a href="#" style="font-size:11px;color:#707975;text-decoration:none;margin:0 10px;">Abonelikten Çık</a>
                    </div>
                    <div style="margin-top:24px;font-size:9px;font-weight:700;color:#bfc9c4;letter-spacing:0.1em;">🔒 ENCRYPTED TRANSACTION</div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    this.writeDebugLog(`Attempting to send verification code to: ${to}`);

    // Try sending actual email if transporter is ready
    if (this.transporter) {
      try {
        this.writeDebugLog('Transporter is ready. Calling sendMail...');
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html: htmlContent,
        });
        this.writeDebugLog(`SUCCESS: Verification email sent successfully!
           - From: ${from}
           - To: ${to}
           - Subject: ${subject}
           - SMTP Host: ${process.env.SMTP_HOST}
           - SMTP Port: ${process.env.SMTP_PORT}
           - Verification Code: ${code}`);
        logger.info(`[MailService] Verification email sent successfully to ${to}`);
        return true;
      } catch (error: any) {
        this.writeDebugLog(`ERROR during sendMail: ${error.message || error}`);
        logger.error(`[MailService] Failed to send verification email to ${to}:`, error);
      }
    } else {
      this.writeDebugLog('STATUS: Transporter is null (SMTP not connected/verified). Using Mock fallback.');
    }

    // fallback log
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    logger.info(`
==================== [MOCK EMAIL SENT - DETAILED DETAILS] ====================
[SMTP Config]
Host: ${smtpHost}
Port: ${smtpPort}
Auth User (Sender): ${smtpUser}
Auth Pass (Password): ${smtpPass}

[Email Headers]
From: ${from}
To: ${to}
Subject: ${subject}
Verification Code: ${code}

[HTML Content]
${htmlContent}
=============================================================================
`);
    return false;
  }

  /**
   * Sends an offer email to the student.
   */
  async sendOfferEmail(to: string, studentName: string, taskTitle: string, companyName: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || `"Sinerji" <${process.env.SMTP_USER}>`;
    const subject = `Sinerji - Yeni İş Teklifi: ${taskTitle}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin:0;padding:20px;font-family:sans-serif;background-color:#f6f5f0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;">
          <h2>Tebrikler ${studentName}! 🎉</h2>
          <p><strong>${companyName}</strong> şirketi, <strong>"${taskTitle}"</strong> başlıklı göreviniz için başvurunuzu onayladı ve ödeme güvence altına alındı.</p>
          <p>Görevi kabul etmek veya reddetmek için lütfen Sinerji portalına giriş yapın.</p>
          <a href="http://localhost:3000/student/applications" style="display:inline-block;padding:12px 24px;background-color:#00342b;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Başvurularıma Git</a>
        </div>
      </body>
      </html>
    `;

    this.writeDebugLog(`Attempting to send offer email to: ${to}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html: htmlContent,
        });
        logger.info(`[MailService] Offer email sent successfully to ${to}`);
        return true;
      } catch (error: any) {
        logger.error(`[MailService] Failed to send offer email to ${to}:`, error);
      }
    } else {
      logger.info(`[MOCK EMAIL] Offer Email sent to ${to} for task ${taskTitle}`);
    }
    return false;
  }

  /**
   * Sends an internship guarantee certificate email to the student.
   */
  async sendInternshipGuaranteeEmail(to: string, studentName: string, companyName: string, guaranteeUrl: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || `"Sinerji" <${process.env.SMTP_USER}>`;
    const subject = `Tebrikler! ${companyName} şirketinden Resmi Başarı Onayı kazandınız`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin:0;padding:20px;font-family:sans-serif;background-color:#f6f5f0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;">
          <h2>Tebrikler ${studentName}! 🎉</h2>
          <p><strong>${companyName}</strong> şirketi, tamamladığınız görev sonrasında size bir staj, sertifika veya tavsiye sunduğunu resmi olarak onayladı.</p>
          <p>Şirketin bu taahhüdünü gösteren dijital kabul belgeniz oluşturuldu.</p>
          <a href="${guaranteeUrl}" style="display:inline-block;padding:12px 24px;background-color:#00342b;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Kabul Belgesini Görüntüle</a>
        </div>
      </body>
      </html>
    `;

    this.writeDebugLog(`Attempting to send guarantee email to: ${to}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html: htmlContent,
        });
        logger.info(`[MailService] Guarantee email sent successfully to ${to}`);
        return true;
      } catch (error: any) {
        logger.error(`[MailService] Failed to send guarantee email to ${to}:`, error);
      }
    } else {
      logger.info(`[MOCK EMAIL] Guarantee Email sent to ${to}`);
    }
    return false;
  }

  async sendSubmissionDeliveredEmail(to: string, companyName: string, taskTitle: string, studentName: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || `"Sinerji" <${process.env.SMTP_USER}>`;
    const subject = `Sinerji - Görev Teslim Edildi: ${taskTitle}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:20px;font-family:sans-serif;background-color:#f6f5f0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;">
          <h2>Merhaba ${companyName},</h2>
          <p><strong>${studentName}</strong>, <strong>"${taskTitle}"</strong> başlıklı görev için çalışmasını teslim etti.</p>
          <p>Lütfen Sinerji portalına giriş yaparak teslim edilen çalışmayı inceleyin ve onaylayın.</p>
          <a href="http://localhost:3000/company/tasks" style="display:inline-block;padding:12px 24px;background-color:#00342b;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Görevlere Git</a>
        </div>
      </body>
      </html>
    `;

    this.writeDebugLog(`Attempting to send delivery email to: ${to}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html: htmlContent });
        return true;
      } catch (error: any) {}
    }
    return false;
  }

  async sendTaskCompletedEmail(to: string, studentName: string, taskTitle: string): Promise<boolean> {
    const from = process.env.SMTP_FROM || `"Sinerji" <${process.env.SMTP_USER}>`;
    const subject = `Sinerji - Göreviniz Onaylandı: ${taskTitle}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:20px;font-family:sans-serif;background-color:#f6f5f0;">
        <div style="max-width:540px;margin:0 auto;background:#fff;padding:40px;border-radius:16px;">
          <h2>Tebrikler ${studentName}! 🎉</h2>
          <p><strong>"${taskTitle}"</strong> başlıklı göreviniz şirket tarafından onaylandı!</p>
          <p>Eğer görev ücretliyse, ödemeniz kısa süre içinde hesabınıza aktarılacaktır.</p>
          <a href="http://localhost:3000/student/applications" style="display:inline-block;padding:12px 24px;background-color:#00342b;color:#fff;text-decoration:none;border-radius:8px;margin-top:20px;">Portala Git</a>
        </div>
      </body>
      </html>
    `;

    this.writeDebugLog(`Attempting to send completion email to: ${to}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({ from, to, subject, html: htmlContent });
        return true;
      } catch (error: any) {}
    }
    return false;
  }
}
