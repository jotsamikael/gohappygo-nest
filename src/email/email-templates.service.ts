import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailTemplatesService {
  private readonly baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  getWelcomeTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to GoHappyGo!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Welcome to GoHappyGo! Your account has been successfully created.</p>
            <p>We're excited to have you join our community of travelers and package senders.</p>
            <p>To get started:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Verify your phone number</li>
              <li>Upload verification documents</li>
              <li>Start posting travels or demands</li>
            </ul>
            <p style="text-align: center;">
              <a href="${this.baseUrl}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPhoneVerificationTemplate(userName: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Phone Verification - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .verification-code { font-size: 24px; font-weight: bold; text-align: center; padding: 20px; background: #e3f2fd; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Phone Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Please use the following verification code to verify your phone number:</p>
            <div class="verification-code">${verificationCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getVerificationDocumentsReceivedTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Documents Received - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Documents Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We have received your verification documents and they are now under review.</p>
            <p>Our team will review your documents within 24-48 hours and you will receive an email notification once the review is complete.</p>
            <p>Thank you for your patience!</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getVerificationApprovedTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Verified - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Verified!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${userName}!</h2>
            <p>Your account has been successfully verified. You can now:</p>
            <ul>
              <li>Post travel declarations</li>
              <li>Publish delivery demands</li>
              <li>Make requests to other users</li>
              <li>Complete transactions</li>
            </ul>
            <p style="text-align: center;">
              <a href="${this.baseUrl}/dashboard" class="button">Start Using GoHappyGo</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getVerificationRejectedTemplate(userName: string, reason: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verification Update - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .reason { background: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0; }
          .button { display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verification Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We regret to inform you that your verification documents could not be approved at this time.</p>
            <div class="reason">
              <strong>Reason:</strong> ${reason}
            </div>
            <p>Please review the reason above and submit new documents that meet our requirements.</p>
            <p style="text-align: center;">
              <a href="${this.baseUrl}/verification" class="button">Resubmit Documents</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getTravelPublishedTemplate(userName: string, travelData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Travel Published - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .travel-details { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Travel Published Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your travel has been successfully published and is now visible to potential package senders.</p>
            <div class="travel-details">
              <h3>Travel Details:</h3>
              <p><strong>Flight:</strong> ${travelData.flightNumber}</p>
              <p><strong>From:</strong> ${travelData.departureAirport}</p>
              <p><strong>To:</strong> ${travelData.arrivalAirport}</p>
              <p><strong>Date:</strong> ${new Date(travelData.departureDatetime).toLocaleDateString()}</p>
              <p><strong>Available Weight:</strong> ${travelData.weightAvailable}kg</p>
            </div>
            <p>You will be notified when someone makes a request for your travel.</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getDemandPublishedTemplate(userName: string, demandData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Demand Published - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .demand-details { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Demand Published Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your delivery demand has been successfully published and is now visible to potential travelers.</p>
            <div class="demand-details">
              <h3>Demand Details:</h3>
              <p><strong>Title:</strong> ${demandData.title}</p>
              <p><strong>From:</strong> ${demandData.originAirport}</p>
              <p><strong>To:</strong> ${demandData.destinationAirport}</p>
              <p><strong>Delivery Date:</strong> ${new Date(demandData.deliveryDate).toLocaleDateString()}</p>
              <p><strong>Weight:</strong> ${demandData.weight}kg</p>
              <p><strong>Price per kg:</strong> $${demandData.pricePerKg}</p>
            </div>
            <p>You will be notified when someone offers to help with your delivery.</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getRequestAcceptedTemplate(userName: string, requestData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Request Accepted - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .request-details { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Request Accepted!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Great news! Your request has been accepted.</p>
            <div class="request-details">
              <h3>Request Details:</h3>
              <p><strong>Type:</strong> ${requestData.requestType}</p>
              <p><strong>Offer Price:</strong> $${requestData.offerPrice}</p>
              ${requestData.weight ? `<p><strong>Weight:</strong> ${requestData.weight}kg</p>` : ''}
            </div>
            <p>You can now communicate with the other party and complete the transaction.</p>
            <p style="text-align: center;">
              <a href="${this.baseUrl}/requests/${requestData.id}" class="button">View Request Details</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getTransactionCompletedTemplate(userName: string, transactionData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Transaction Completed - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .transaction-details { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Transaction Completed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your transaction has been successfully completed.</p>
            <div class="transaction-details">
              <h3>Transaction Details:</h3>
              <p><strong>Amount:</strong> $${transactionData.amount}</p>
              <p><strong>Status:</strong> ${transactionData.status}</p>
              <p><strong>Payment Method:</strong> ${transactionData.paymentMethod}</p>
            </div>
            <p>Thank you for using GoHappyGo!</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(userName: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification - GoHappyGo</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .verification-code { font-size: 24px; font-weight: bold; text-align: center; padding: 20px; background: #e8f5e8; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Please use the following verification code to verify your email address:</p>
            <div class="verification-code">${verificationCode}</div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 GoHappyGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
} 