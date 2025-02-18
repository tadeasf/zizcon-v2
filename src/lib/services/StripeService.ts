import Stripe from 'stripe';
import { ApiTrackingService, ApiSource } from './ApiTrackingService';

export class StripeService {
  private stripe: Stripe;
  private apiTracker: ApiTrackingService | null = null;

  constructor(private stripeSecretKey: string) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-01-27.acacia' // Using latest stable version
    });
    this.initializeApiTracker();
  }

  private async initializeApiTracker() {
    this.apiTracker = await ApiTrackingService.getInstance();
  }

  private async trackApiCall() {
    await this.apiTracker?.trackApiCall(ApiSource.STRIPE_API);
  }

  async findCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
    try {
      await this.trackApiCall();
      const customers = await this.stripe.customers.list({
        email,
        limit: 1
      });

      return customers.data[0] || null;
    } catch (error) {
      console.error('Error finding Stripe customer by email:', error);
      throw error;
    }
  }

  async findCustomerById(customerId: string): Promise<Stripe.Customer | null> {
    try {
      await this.trackApiCall();
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      if ((error as Stripe.errors.StripeError).code === 'resource_missing') {
        return null;
      }
      console.error('Error finding Stripe customer by ID:', error);
      throw error;
    }
  }

  async createCustomer(params: {
    email: string;
    auth0UserId: string;
    description?: string;
  }): Promise<Stripe.Customer> {
    try {
      await this.trackApiCall();
      return await this.stripe.customers.create({
        email: params.email,
        description: params.description || 'Created via Auth0 integration',
        metadata: {
          auth0_user_id: params.auth0UserId
        }
      });
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: string, params: {
    email?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    try {
      await this.trackApiCall();
      return await this.stripe.customers.update(customerId, params);
    } catch (error) {
      console.error('Error updating Stripe customer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.trackApiCall();
      await this.stripe.customers.del(customerId);
    } catch (error) {
      if ((error as Stripe.errors.StripeError).code !== 'resource_missing') {
        console.error('Error deleting Stripe customer:', error);
        throw error;
      }
    }
  }
} 