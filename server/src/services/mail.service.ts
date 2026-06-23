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
    const from = process.env.SMTP_FROM || '"Sinerji" <noreply@sinerji.com>';
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
      <body>
        <div class="email-wrapper">
          <div class="header-bg">
            <h1 class="header-title">Sinerji</h1>
          </div>
          
          <div class="card-container">
            <div class="badge-container">
              <span class="badge-icon">✓</span>
            </div>
            
            <span class="badge-sub">Security Verification</span>
            <h2 class="headline">Identity Confirmation</h2>
            <p class="intro-text">
              Merhaba <strong>${studentName}</strong>,<br><br>
              Sinerji üniversite portalı çift aşamalı öğrenci kimlik doğrulama işlemini tamamlamak için lütfen aşağıdaki tek kullanımlık güvenlik kodunu kullanın.
            </p>
            
            <div class="otp-box">
              <span class="otp-label">Doğrulama Kodunuz</span>
              <div class="otp-code">${code}</div>
              <div class="expiry-text">
                ⏱ Geçerlilik süresi: 3 dakikadır
              </div>
            </div>
            
            <div style="margin-top: 24px;">
              <a href="http://localhost:3000/student/settings" class="cta-btn">Portala Devam Et</a>
            </div>
            
            <div style="margin-top: 12px;">
              <a href="#" class="security-link">İşlemi siz başlatmadıysanız hesabınızı güvenceye alın</a>
            </div>
            
            <div class="divider"></div>
            
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="text-align: left; vertical-align: top; width: 60%;">
                  <h3 style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600; color: #00342b; margin: 0 0 8px 0;">Akademik Güvenilirlik</h3>
                  <p style="font-size: 12px; line-height: 18px; color: #707975; margin: 0;">
                    Sinerji, akademik verilerinizi ve kişisel kayıtlarınızı korumak için en yüksek güvenlik standartlarını uygular.
                  </p>
                </td>
                <td style="text-align: right; width: 40%; padding-left: 20px;">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxWfG-JKfxT3CMenypM0pKFbPvhpcyh_dJ2lDzf-iOIi0-Em3wIO-l1T63b6hHRB4_fPFHbWwEwe7URZ1r6Nquq5Ta6Rvpf4wawbl2zmShWDRu6geDMbHUlzmbp3L4Ssxmap_uKzmyi4G2JJglkJk9wVQdvmuPIbYBzC7-Zldf0SX2BTp3GSieaKcTvn6pPyL08hSv0_ThIAoVOgHz9Yi-5aAPmuuUkRTQ1BbqtoNskl8xiHGD6dItv4pfevZR8MBWo__zsLevPRwZ" 
                       style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; filter: grayscale(30%);" 
                       alt="University architecture">
                </td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <div class="footer-title">SINERJI UNIVERSITY</div>
            <p class="footer-text">
              © 2026 Sinerji University Verification Portal. All rights reserved.
            </p>
            <div class="footer-links">
              <a href="#">Gizlilik Politikası</a>
              <a href="#">Destek Talebi</a>
              <a href="#">Abonelikten Çık</a>
            </div>
            <div class="encrypted-badge">
              🔒 ENCRYPTED TRANSACTION
            </div>
          </div>
        </div>
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
        this.writeDebugLog(`SUCCESS: Verification email sent successfully to ${to}`);
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
}
