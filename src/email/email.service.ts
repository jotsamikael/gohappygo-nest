import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplatesService } from './email-templates.service';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplatesService: EmailTemplatesService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASSWORD');

    // Skip email setup if no credentials provided
    if (!emailUser || !emailPass) {
      this.logger.warn('Gmail credentials not configured. Email sending will be skipped.');
      this.logger.warn(`EMAIL_USER: ${emailUser ? 'Set' : 'Not Set'}`);
      this.logger.warn(`EMAIL_PASSWORD: ${emailPass ? 'Set' : 'Not Set'}`);
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Gmail connection failed:', error);
      } else {
        this.logger.log('Gmail server is ready to send messages');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Gmail not configured. Skipping email send.');
      return false;
    }

    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER'),
        to: options.to, // Recipient email address
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };
  // Debug log to verify recipient
  this.logger.log(`Sending email to: ${options.to}, from: ${mailOptions.from}`);

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully via Gmail: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email via Gmail:', error);
      return false;
    }
  }

  // Convenience methods for common emails
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = this.emailTemplatesService.getWelcomeTemplate(userName);
    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to GoHappyGo!',
      html,
    });
  }

  async sendPhoneVerificationEmail(userEmail: string, userName: string, verificationCode: string): Promise<boolean> {
    const html = this.emailTemplatesService.getPhoneVerificationTemplate(userName, verificationCode);
    return this.sendEmail({
      to: userEmail,
      subject: 'Verify Your Phone Number - GoHappyGo',
      html,
    });
  }

  async sendVerificationDocumentsReceived(userEmail: string, userName: string): Promise<boolean> {
    const html = this.emailTemplatesService.getVerificationDocumentsReceivedTemplate(userName);
    return this.sendEmail({
      to: userEmail,
      subject: 'Verification Documents Received - GoHappyGo',
      html,
    });
  }

  async sendVerificationApproved(userEmail: string, userName: string): Promise<boolean> {
    const html = this.emailTemplatesService.getVerificationApprovedTemplate(userName);
    return this.sendEmail({
      to: userEmail,
      subject: 'Account Verified - GoHappyGo',
      html,
    });
  }

  async sendVerificationRejected(userEmail: string, userName: string, reason: string): Promise<boolean> {
    const html = this.emailTemplatesService.getVerificationRejectedTemplate(userName, reason);
    return this.sendEmail({
      to: userEmail,
      subject: 'Verification Update - GoHappyGo',
      html,
    });
  }

  async sendTravelPublishedConfirmation(userEmail: string, userName: string, travelData: any): Promise<boolean> {
    const html = this.emailTemplatesService.getTravelPublishedTemplate(userName, travelData);
    return this.sendEmail({
      to: userEmail,
      subject: 'Travel Published Successfully - GoHappyGo',
      html,
    });
  }

  async sendDemandPublishedConfirmation(userEmail: string, userName: string, demandData: any): Promise<boolean> {
    const html = this.emailTemplatesService.getDemandPublishedTemplate(userName, demandData);
    return this.sendEmail({
      to: userEmail,
      subject: 'Demand Published Successfully - GoHappyGo',
      html,
    });
  }

  async sendRequestAccepted(userEmail: string, userName: string, requestData: any): Promise<boolean> {
    const html = this.emailTemplatesService.getRequestAcceptedTemplate(userName, requestData);
    return this.sendEmail({
      to: userEmail,
      subject: 'Request Accepted - GoHappyGo',
      html,
    });
  }

  async sendTransactionCompleted(userEmail: string, userName: string, transactionData: any): Promise<boolean> {
    const html = this.emailTemplatesService.getTransactionCompletedTemplate(userName, transactionData);
    return this.sendEmail({
      to: userEmail,
      subject: 'Transaction Completed - GoHappyGo',
      html,
    });
  }
}