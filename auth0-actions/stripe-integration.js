/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const stripe = require('stripe')(event.secrets.STRIPE_SECRET_KEY);
  
  try {
    // Skip if user already has a Stripe customer ID
    if (event.user.app_metadata?.stripe_customer_id) {
      console.log('User already has Stripe customer ID:', event.user.app_metadata.stripe_customer_id);
      return;
    }

    // Try to find existing customer by email
    const customers = await stripe.customers.search({
      query: `email:'${event.user.email}'`,
      limit: 1
    });

    let customerId;
    
    if (customers.data.length > 0) {
      // Update existing customer with Auth0 metadata
      const customer = customers.data[0];
      await stripe.customers.update(customer.id, {
        metadata: { auth0_user_id: event.user.user_id }
      });
      customerId = customer.id;
      console.log('Updated existing Stripe customer:', customerId);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: event.user.email,
        name: `${event.user.given_name || ''} ${event.user.family_name || ''}`.trim() || undefined,
        metadata: {
          auth0_user_id: event.user.user_id
        }
      });
      customerId = customer.id;
      console.log('Created new Stripe customer:', customerId);
    }

    // Store Stripe customer ID in Auth0 metadata
    api.user.setAppMetadata('stripe_customer_id', customerId);
    
  } catch (error) {
    console.error('Stripe integration error:', error);
    // Don't throw - we don't want to block login if Stripe integration fails
  }
}; 