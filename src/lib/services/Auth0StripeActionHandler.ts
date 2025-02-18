import { StripeService } from './StripeService';
import { ApiTrackingService, ApiSource } from './ApiTrackingService';

interface Auth0Event {
  user: {
    email: string;
    user_id: string;
    app_metadata: {
      stripe_customer_id?: string;
    };
  };
  stats: {
    logins_count: number;
  };
  secrets: {
    STRIPE_SECRET_KEY: string;
  };
}

interface Auth0Metadata {
  stripe_customer_id: string;
}

interface Auth0Api {
  user: {
    setAppMetadata: (userId: string, metadata: Auth0Metadata) => Promise<void>;
  };
  access: {
    deny: (message: string) => void;
  };
}

export class Auth0StripeActionHandler {
  private stripeService: StripeService;
  private apiTracker: ApiTrackingService | null = null;

  constructor(private event: Auth0Event, private api: Auth0Api) {
    if (!event.secrets.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required but not provided');
    }
    this.stripeService = new StripeService(event.secrets.STRIPE_SECRET_KEY);
    this.initializeApiTracker();
  }

  private async initializeApiTracker() {
    this.apiTracker = await ApiTrackingService.getInstance();
  }

  private async trackApiCall() {
    await this.apiTracker?.trackApiCall(ApiSource.AUTH0_MGMT_API);
  }

  async handlePostLogin(): Promise<void> {
    try {
      await this.trackApiCall();
      const { user } = this.event;

      // Check if user already has a Stripe customer ID
      if (user.app_metadata?.stripe_customer_id) {
        await this.ensureStripeCustomerSync();
        return;
      }

      // Check if customer already exists in Stripe by email
      const existingCustomer = await this.stripeService.findCustomerByEmail(user.email);
      
      if (existingCustomer) {
        // Link existing customer to Auth0 user
        await this.api.user.setAppMetadata(user.user_id, {
          stripe_customer_id: existingCustomer.id
        });
        return;
      }

      // Create new Stripe customer
      const newCustomer = await this.stripeService.createCustomer({
        email: user.email,
        auth0UserId: user.user_id
      });

      // Update Auth0 app_metadata with Stripe customer ID
      await this.api.user.setAppMetadata(user.user_id, {
        stripe_customer_id: newCustomer.id
      });

      console.log('Created new Stripe customer:', {
        email: user.email,
        auth0UserId: user.user_id,
        stripeCustomerId: newCustomer.id
      });

    } catch (error) {
      console.error('Error in Auth0 Stripe integration:', error);
      // Don't deny access for existing users
      if (this.event.stats.logins_count === 1) {
        this.api.access.deny(
          'We could not create your account.\nPlease contact support for assistance.'
        );
      }
    }
  }

  private async ensureStripeCustomerSync(): Promise<void> {
    const { user } = this.event;

    try {
      // If user has a Stripe customer ID, verify it exists and is up to date
      if (user.app_metadata.stripe_customer_id) {
        const customer = await this.stripeService.findCustomerById(user.app_metadata.stripe_customer_id);
        
        if (customer) {
          // Update customer if email has changed
          if (customer.email !== user.email) {
            await this.stripeService.updateCustomer(customer.id, {
              email: user.email,
              metadata: {
                auth0_user_id: user.user_id
              }
            });
          }
        } else {
          // Customer doesn't exist in Stripe, create new one
          const newCustomer = await this.stripeService.createCustomer({
            email: user.email,
            auth0UserId: user.user_id
          });
          await this.api.user.setAppMetadata(user.user_id, {
            stripe_customer_id: newCustomer.id
          });
        }
      }
    } catch (error) {
      console.error('Error syncing Stripe customer:', error);
      // Don't deny access for sync errors on existing users
    }
  }
} 