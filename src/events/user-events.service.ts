import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEntity } from 'src/user/user.entity';
import { UserEventType } from './event-types';

// Base event interface
export interface BaseUserEvent {
  userId: number;
  userEmail: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Specific event interfaces
export interface UserRegisteredEvent extends BaseUserEvent {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PhoneVerificationEvent extends BaseUserEvent {
  phoneNumber: string;
  verificationCode?: string;
}

export interface VerificationDocumentsEvent extends BaseUserEvent {
  documentTypes: string[];
  fileCount: number;
  notes?: string;
}

export interface VerificationStatusEvent extends BaseUserEvent {
  status: 'approved' | 'rejected';
  reason?: string;
  reviewedBy?: {
    id: number;
    email: string;
  };
}

export interface TravelEvent extends BaseUserEvent {
  travelId: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: Date;
}

export interface DemandEvent extends BaseUserEvent {
  demandId: number;
  title: string;
  originAirport: string;
  destinationAirport: string;
  deliveryDate: Date;
}

export interface RequestEvent extends BaseUserEvent {
  requestId: number;
  requestType: 'GoAndGo' | 'GoAndGive';
  offerPrice: number;
  relatedTravelId?: number;
  relatedDemandId?: number;
}

export interface TransactionEvent extends BaseUserEvent {
  transactionId: number;
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod: string;
}

export interface MessageEvent extends BaseUserEvent {
  messageId: number;
  receiverId: number;
  requestId: number;
  content: string;
}

export interface ReviewEvent extends BaseUserEvent {
  reviewId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
}

export interface EmailVerificationEvent extends BaseUserEvent {
  email: string;
  verificationCode?: string;
}

@Injectable()
export class UserEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  // Authentication Events
  emitUserRegistered(user: UserEntity): void {
    const event: UserRegisteredEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
    this.eventEmitter.emit(UserEventType.USER_REGISTERED, event);
  }

  emitUserLoggedIn(user: UserEntity, ipAddress?: string): void {
    const event: BaseUserEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: { ipAddress, userAgent: 'web' },
    };
    this.eventEmitter.emit(UserEventType.USER_LOGGED_IN, event);
  }

  emitPasswordChanged(user: UserEntity): void {
    const event: BaseUserEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
    };
    this.eventEmitter.emit(UserEventType.PASSWORD_CHANGED, event);
  }

  // Verification Events
  emitPhoneVerificationRequested(user: UserEntity, phoneNumber: string): void {
    const event: PhoneVerificationEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      phoneNumber,
    };
    this.eventEmitter.emit(UserEventType.PHONE_VERIFICATION_REQUESTED, event);
  }

  emitPhoneVerified(user: UserEntity, phoneNumber: string): void {
    const event: PhoneVerificationEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      phoneNumber,
    };
    this.eventEmitter.emit(UserEventType.PHONE_VERIFIED, event);
  }

  emitEmailVerified(user: UserEntity, email: string): void {
    const event: EmailVerificationEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      email,
    };
    this.eventEmitter.emit(UserEventType.EMAIL_VERIFIED, event);
  }

  emitVerificationDocumentsUploaded(
    user: UserEntity, 
    documentTypes: string[], 
    fileCount: number,
    notes?: string
  ): void {
    const event: VerificationDocumentsEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      documentTypes,
      fileCount,
      notes,
    };
    this.eventEmitter.emit(UserEventType.VERIFICATION_DOCUMENTS_UPLOADED, event);
  }

  emitVerificationStatusChanged(
    user: UserEntity,
    status: 'approved' | 'rejected',
    reason?: string,
    reviewedBy?: UserEntity
  ): void {
    const event: VerificationStatusEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      status,
      reason,
      reviewedBy: reviewedBy ? {
        id: reviewedBy.id,
        email: reviewedBy.email,
      } : undefined,
    };
    
    const eventType = status === 'approved' 
      ? UserEventType.VERIFICATION_APPROVED 
      : UserEventType.VERIFICATION_REJECTED;
    
    this.eventEmitter.emit(eventType, event);
  }

  // Travel Events
  emitTravelPublished(user: UserEntity, travelData: any): void {
    const event: TravelEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      travelId: travelData.id,
      flightNumber: travelData.flightNumber,
      departureAirport: travelData.departureAirport?.airportName || 'Unknown',
      arrivalAirport: travelData.arrivalAirport?.airportName || 'Unknown',
      departureDate: travelData.departureDatetime,
    };
    this.eventEmitter.emit(UserEventType.TRAVEL_PUBLISHED, event);
  }

  // Demand Events
  emitDemandPublished(user: UserEntity, demandData: any): void {
    const event: DemandEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      demandId: demandData.id,
      title: demandData.title,
      originAirport: demandData.originAirport?.airportName || 'Unknown',
      destinationAirport: demandData.destinationAirport?.airportName || 'Unknown',
      deliveryDate: demandData.deliveryDate,
    };
    this.eventEmitter.emit(UserEventType.DEMAND_PUBLISHED, event);
  }

  // Request Events
  emitRequestCreated(user: UserEntity, requestData: any): void {
    const event: RequestEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      requestId: requestData.id,
      requestType: requestData.requestType,
      offerPrice: requestData.offerPrice,
      relatedTravelId: requestData.travelId,
      relatedDemandId: requestData.demandId,
    };
    this.eventEmitter.emit(UserEventType.REQUEST_CREATED, event);
  }

  emitRequestAccepted(user: UserEntity, requestData: any): void {
    const event: RequestEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      requestId: requestData.id,
      requestType: requestData.requestType,
      offerPrice: requestData.offerPrice,
      relatedTravelId: requestData.travelId,
      relatedDemandId: requestData.demandId,
    };
    this.eventEmitter.emit(UserEventType.REQUEST_ACCEPTED, event);
  }

  // Transaction Events
  emitTransactionCreated(user: UserEntity, transactionData: any): void {
    const event: TransactionEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      transactionId: transactionData.id,
      amount: transactionData.amount,
      status: transactionData.status,
      paymentMethod: transactionData.paymentMethod,
    };
    this.eventEmitter.emit(UserEventType.TRANSACTION_CREATED, event);
  }

  emitTransactionCompleted(user: UserEntity, transactionData: any): void {
    const event: TransactionEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      transactionId: transactionData.id,
      amount: transactionData.amount,
      status: transactionData.status,
      paymentMethod: transactionData.paymentMethod,
    };
    this.eventEmitter.emit(UserEventType.TRANSACTION_COMPLETED, event);
  }

  // Message Events
  emitMessageSent(user: UserEntity, messageData: any): void {
    const event: MessageEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      messageId: messageData.id,
      receiverId: messageData.receiverId,
      requestId: messageData.requestId,
      content: messageData.content,
    };
    this.eventEmitter.emit(UserEventType.MESSAGE_SENT, event);
  }

  // Review Events
  emitReviewPosted(user: UserEntity, reviewData: any): void {
    const event: ReviewEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      reviewId: reviewData.id,
      revieweeId: reviewData.revieweeId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    };
    this.eventEmitter.emit(UserEventType.REVIEW_POSTED, event);
  }

  // Security Events
  emitSuspiciousActivity(user: UserEntity, activity: string): void {
    const event: BaseUserEvent = {
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: { activity, severity: 'medium' },
    };
    this.eventEmitter.emit(UserEventType.SUSPICIOUS_ACTIVITY, event);
  }
}