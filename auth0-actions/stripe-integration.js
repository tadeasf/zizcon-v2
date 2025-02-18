/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  console.log('Starting Stripe integration post-login action:', {
    userId: event.user.user_id,
    email: event.user.email,
    hasStripeId: !!event.user.app_metadata?.stripe_customer_id,
    loginCount: event.stats.logins_count,
    hasStripeSecret: !!event.secrets.STRIPE_SECRET_KEY
  });

  if (!event.secrets.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured in Auth0 action secrets');
    return;
  }

  const stripe = require('stripe')(event.secrets.STRIPE_SECRET_KEY);
  
  try {
    // Log initial state
    console.log('Current user metadata:', {
      app_metadata: event.user.app_metadata,
      user_metadata: event.user.user_metadata
    });

    // Skip if user already has a Stripe customer ID
    if (event.user.app_metadata?.stripe_customer_id) {
      console.log('User already has Stripe customer ID:', {
        userId: event.user.user_id,
        stripeCustomerId: event.user.app_metadata.stripe_customer_id
      });
      return;
    }

    console.log('Searching for existing Stripe customer:', {
      email: event.user.email
    });

    // Try to find existing customer by email
    const customers = await stripe.customers.search({
      query: `email:'${event.user.email}'`,
      limit: 1
    });

    console.log('Stripe customer search results:', {
      found: customers.data.length > 0,
      totalFound: customers.data.length
    });

    let customerId;
    
    if (customers.data.length > 0) {
      // Update existing customer with Auth0 metadata
      const customer = customers.data[0];
      console.log('Found existing customer:', {
        customerId: customer.id,
        customerEmail: customer.email,
        metadata: customer.metadata
      });

      await stripe.customers.update(customer.id, {
        metadata: { auth0_user_id: event.user.user_id }
      });
      customerId = customer.id;
      console.log('Updated existing Stripe customer:', {
        customerId,
        auth0UserId: event.user.user_id
      });
    } else {
      // Create new customer
      console.log('Creating new Stripe customer:', {
        email: event.user.email,
        auth0UserId: event.user.user_id
      });

      const customer = await stripe.customers.create({
        email: event.user.email,
        name: `${event.user.given_name || ''} ${event.user.family_name || ''}`.trim() || undefined,
        metadata: {
          auth0_user_id: event.user.user_id
        }
      });
      customerId = customer.id;
      console.log('Created new Stripe customer:', {
        customerId,
        customerEmail: customer.email,
        metadata: customer.metadata
      });
    }

    // Store Stripe customer ID in Auth0 metadata
    console.log('Setting Auth0 app metadata:', {
      userId: event.user.user_id,
      stripeCustomerId: customerId
    });

    await api.user.setAppMetadata('stripe_customer_id', customerId);
    
    console.log('Successfully completed Stripe integration:', {
      userId: event.user.user_id,
      stripeCustomerId: customerId
    });
  } catch (error) {
    console.error('Stripe integration error:', {
      error: error.message,
      code: error.code,
      type: error.type,
      userId: event.user.user_id,
      email: event.user.email
    });
    // Don't throw - we don't want to block login if Stripe integration fails
  }
}; 