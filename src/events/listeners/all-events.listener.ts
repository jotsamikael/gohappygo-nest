import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserEventType } from '../event-types';
import { 
  UserRegisteredEvent,
  PhoneVerificationEvent, 
  VerificationDocumentsEvent, 
  VerificationStatusEvent,
  TravelEvent,
  DemandEvent,
  TransactionEvent
} from '../user-events.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class AllEventsListener {
  private readonly logger = new Logger(AllEventsListener.name);

  constructor(private emailService: EmailService) {}

  // User Registration
  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    const {user, timestamp} = event;
    this.logger.log(`Welcome, ${user.email}! Account created at ${timestamp.toISOString()}`);
    
 // Debug log to verify the email being passed
 this.logger.log(`Sending welcome email to: ${user.email}`);
  

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);
  }

  // Verification Events
  @OnEvent(UserEventType.PHONE_VERIFICATION_REQUESTED)
  async handlePhoneVerificationRequested(event: PhoneVerificationEvent): Promise<void> {
    this.logger.log(`Phone verification requested for ${event.userEmail} - ${event.phoneNumber}`);
    
   
    // TODO: send confirmation code by sms
    //For now, send email to verified user
    await this.emailService.sendPhoneVerificationEmail(event.userEmail, 'User', event.verificationCode!);
    
  }

  @OnEvent(UserEventType.PHONE_VERIFIED)
  async handlePhoneVerified(event: PhoneVerificationEvent): Promise<void> {
    this.logger.log(`Phone verified for ${event.userEmail} - ${event.phoneNumber}`);
  }

  @OnEvent(UserEventType.VERIFICATION_DOCUMENTS_UPLOADED)
  async handleVerificationDocumentsUploaded(event: VerificationDocumentsEvent): Promise<void> {
    this.logger.log(`Documents uploaded for ${event.userEmail} - ${event.documentTypes.join(', ')}`);
    
    // Send confirmation email
    await this.emailService.sendVerificationDocumentsReceived(event.userEmail, 'User');
  }

  @OnEvent(UserEventType.VERIFICATION_APPROVED)
  async handleVerificationApproved(event: VerificationStatusEvent): Promise<void> {
    this.logger.log(`Verification approved for ${event.userEmail} by ${event.reviewedBy?.email || 'Unknown'}`);
    
    // Send approval email
    await this.emailService.sendVerificationApproved(event.userEmail, 'User');
  }

  @OnEvent(UserEventType.VERIFICATION_REJECTED)
  async handleVerificationRejected(event: VerificationStatusEvent): Promise<void> {
    this.logger.log(`Verification rejected for ${event.userEmail} - Reason: ${event.reason}`);
    
    // Send rejection email
    await this.emailService.sendVerificationRejected(event.userEmail, 'User', event.reason || 'Documents do not meet requirements');
  }

  // Travel & Demand Events
  @OnEvent(UserEventType.TRAVEL_PUBLISHED)
  async handleTravelPublished(event: TravelEvent): Promise<void> {
    this.logger.log(`Travel published by ${event.userEmail} - ${event.flightNumber}`);
    
    // Send confirmation email
    await this.emailService.sendTravelPublishedConfirmation(event.userEmail, 'User', event);
  }

  @OnEvent(UserEventType.DEMAND_PUBLISHED)
  async handleDemandPublished(event: DemandEvent): Promise<void> {
    this.logger.log(`Demand published by ${event.userEmail} - ${event.title}`);
    
    // Send confirmation email
    await this.emailService.sendDemandPublishedConfirmation(event.userEmail, 'User', event);
  }

  // Transaction Events
  @OnEvent(UserEventType.TRANSACTION_CREATED)
  async handleTransactionCreated(event: TransactionEvent): Promise<void> {
    this.logger.log(`Transaction created for ${event.userEmail} - $${event.amount}`);
  }

  @OnEvent(UserEventType.TRANSACTION_COMPLETED)
  async handleTransactionCompleted(event: TransactionEvent): Promise<void> {
    this.logger.log(`Transaction completed for ${event.userEmail} - $${event.amount}`);
    
    // Send completion email
    await this.emailService.sendTransactionCompleted(event.userEmail, 'User', event);
  }
} 