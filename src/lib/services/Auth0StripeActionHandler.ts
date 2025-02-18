import { StripeService } from './StripeService';
import { useUserSyncStore } from '../stores/userSyncStore';
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

interface Auth0Api {
  user: {
    setAppMetadata: (key: string, value: string) => Promise<void>;
  };
  access: {
    deny: (message: string) => void;
  };
}

export class Auth0StripeActionHandler {
  private stripeService: StripeService;
  private apiTracker: ApiTrackingService | null = null;

  constructor(private event: Auth0Event, private api: Auth0Api) {
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

      // Only proceed for new users
      if (this.event.stats.logins_count !== 1) {
        await this.ensureStripeCustomerSync();
        return;
      }

      // Check for data integrity
      if (this.event.user.app_metadata.stripe_customer_id) {
        const error = 'app_metadata for new user already has stripe_customer_id property.';
        console.error(error);
        this.api.access.deny(
          'We could not create your account.\nPlease contact support for assistance.'
        );
        return;
      }

      // Check if customer already exists in Stripe
      const existingCustomer = await this.stripeService.findCustomerByEmail(this.event.user.email);
      if (existingCustomer) {
        const error = `Stripe Customer with email ${this.event.user.email} already exists.`;
        console.error(error);
        this.api.access.deny(
          'We could not create your account.\nPlease contact support for assistance.'
        );
        return;
      }

      // Create new Stripe customer
      const newCustomer = await this.stripeService.createCustomer({
        email: this.event.user.email,
        auth0UserId: this.event.user.user_id
      });

      // Update Auth0 app_metadata with Stripe customer ID
      await this.api.user.setAppMetadata('stripe_customer_id', newCustomer.id);

      // Update sync store
      const syncStore = useUserSyncStore.getState();
      syncStore.setLastSyncTime(this.event.user.user_id);

    } catch (error) {
      console.error('Error in Auth0 Stripe integration:', error);
      this.api.access.deny(
        'We could not create your account.\nPlease contact support for assistance.'
      );
    }
  }

  private async ensureStripeCustomerSync(): Promise<void> {
    const { user } = this.event;
    const syncStore = useUserSyncStore.getState();

    // Skip if within cache period
    if (!syncStore.shouldSync(user.user_id)) {
      console.log('Skipping Stripe sync - within cache period:', {
        userId: user.user_id,
        email: user.email
      });
      return;
    }

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
          await this.api.user.setAppMetadata('stripe_customer_id', newCustomer.id);
        }
      } else {
        // Check if customer exists by email
        const existingCustomer = await this.stripeService.findCustomerByEmail(user.email);
        
        if (existingCustomer) {
          // Link existing customer to Auth0 user
          await this.stripeService.updateCustomer(existingCustomer.id, {
            metadata: {
              auth0_user_id: user.user_id
            }
          });
          await this.api.user.setAppMetadata('stripe_customer_id', existingCustomer.id);
        } else {
          // Create new customer
          const newCustomer = await this.stripeService.createCustomer({
            email: user.email,
            auth0UserId: user.user_id
          });
          await this.api.user.setAppMetadata('stripe_customer_id', newCustomer.id);
        }
      }

      // Update sync timestamp
      syncStore.setLastSyncTime(user.user_id);
      
    } catch (error) {
      console.error('Error syncing Stripe customer:', error);
      // Don't deny access for sync errors on existing users
    }
  }
} 