import { ManagementClient, ManagementClientOptionsWithClientCredentials } from 'auth0';
import fs from 'fs/promises';
import path from 'path';
import { Auth0ActionClient, Auth0TriggerBinding } from '../src/types/auth0';

interface ActionConfig {
  name: string;
  code: string;
  dependencies: Record<string, string>;
  secrets?: Record<string, string>;
  supported_triggers: {
    id: string;
    version: string;
  }[];
}

const ACTIONS_CONFIG: ActionConfig[] = [
  {
    name: 'Stripe Integration',
    code: path.join(__dirname, '../auth0-actions/stripe-integration.js'),
    dependencies: {
      'stripe': 'latest'
    },
    secrets: {
      'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY!
    },
    supported_triggers: [
      {
        id: 'post-login',
        version: 'v3'
      }
    ]
  }
  // Add more actions here as needed
];

async function deployActions() {
  try {
    // Initialize Auth0 Management API client with our extended type
    const managementClientOptions: ManagementClientOptionsWithClientCredentials = {
      domain: process.env.AUTH0_DOMAIN!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    };

    const managementClient = new ManagementClient(managementClientOptions);

    // Cast to our extended type after creation
    const auth0 = managementClient as unknown as Auth0ActionClient;

    for (const actionConfig of ACTIONS_CONFIG) {
      try {
        console.log(`Starting deployment for action: ${actionConfig.name}`);

        // List all actions first
        console.log('Listing all actions...');
        const response = await auth0.actions.getAll();
        const allActions = response?.data?.actions || [];
        console.log('Current actions:', allActions);

        // Read action code
        console.log('Reading action code...');
        const code = await fs.readFile(actionConfig.code, 'utf8');
        console.log('Action code read successfully');

        let action;
        let actionId;
        try {
          console.log('Creating new action...');
          action = await auth0.actions.create({
            name: actionConfig.name,
            code,
            supported_triggers: actionConfig.supported_triggers,
            runtime: 'node22'
          });
          actionId = action.id;
          console.log(`Successfully created new action: ${action.name}`);
        } catch (error) {
          const managementError = error as { statusCode?: number };
          if (managementError?.statusCode === 409) {
            console.log('Action already exists, retrieving existing action...');
            const allActionsResponse = await auth0.actions.getAll();
            const allActions = allActionsResponse?.data?.actions || [];
            const existingAction = allActions.find(a => a.name === actionConfig.name);

            if (!existingAction) {
              console.error('Could not find existing action despite conflict');
              throw error;
            }

            actionId = existingAction.id;
            console.log(`Found existing action with ID: ${actionId}`);
            console.log('Updating existing action...');
            action = await auth0.actions.update(
              { id: actionId },
              {
                code,
                supported_triggers: actionConfig.supported_triggers,
                runtime: 'node22',
                dependencies: Object.entries(actionConfig.dependencies).map(([name, version]) => ({
                  name,
                  version
                })),
                secrets: actionConfig.secrets ? Object.entries(actionConfig.secrets).map(([name, value]) => {
                  if (!value) {
                    throw new Error(`Secret ${name} is required but not provided`);
                  }
                  return {
                    name,
                    value
                  };
                }) : undefined
              }
            );
            console.log(`Successfully updated action: ${action.name}`);
          } else {
            throw error;
          }
        }

        if (!actionId) {
          throw new Error('No action ID available after create/update');
        }

        // Wait for the action to be built before deploying
        console.log('Waiting for action to be built...');
        let isBuilt = false;
        for (let i = 0; i < 5; i++) {
          try {
            const actionResponse = await auth0.actions.get({ id: actionId });
            const status = actionResponse.data.status;
            console.log(`Current action status: ${status}`);
            
            if (status === 'built') {
              isBuilt = true;
              console.log('Action built successfully');
              break;
            }
            
            console.log(`Attempt ${i + 1}: Action not built yet, waiting 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (error) {
            console.log(`Attempt ${i + 1}: Error checking action status:`, error);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        if (!isBuilt) {
          throw new Error('Action failed to reach built state after multiple retries');
        }

        // Deploy the action
        try {
          console.log('Deploying action...');
          await auth0.actions.deploy({ id: actionId });
          console.log('Action deployed successfully');
        } catch (deployError) {
          console.error('Error deploying action:', deployError);
          throw deployError;
        }

        // Get the trigger bindings
        try {
          console.log('Getting trigger bindings...');
          const triggerBindings = await auth0.actions.getTriggerBindings({ triggerId: 'post-login' });
          console.log('Current trigger bindings:', triggerBindings.data.bindings);

          // Map existing bindings to ensure they match our type structure
          const existingBindings = triggerBindings.data.bindings.map(binding => {
            const bindingWithRef = {
              ...binding,
              ref: {
                type: 'action_name' as const,
                value: binding.action?.name || ''
              }
            };
            return bindingWithRef;
          }) as Auth0TriggerBinding[];

          // Check if action is already bound
          const isActionBound = existingBindings.some(
            (binding) => binding.ref.type === 'action_name' && binding.ref.value === actionConfig.name
          );

          if (!isActionBound) {
            console.log('Binding action to trigger...');
            // Add action to the trigger bindings
            await auth0.actions.updateTriggerBindings(
              { triggerId: 'post-login' },
              {
                bindings: [
                  ...existingBindings,
                  {
                    ref: {
                      type: 'action_name',
                      value: actionConfig.name
                    },
                    display_name: actionConfig.name
                  }
                ]
              }
            );
            console.log('Action bound to trigger successfully');
          } else {
            console.log('Action already bound to trigger');
          }
        } catch (flowError) {
          console.error('Error handling trigger bindings:', flowError);
          throw flowError;
        }
      } catch (actionError) {
        console.error(`Error processing action ${actionConfig.name}:`, actionError);
        throw actionError;
      }
    }

    console.log('All actions deployed successfully!');
  } catch (error) {
    console.error('Error deploying actions:', error);
    process.exit(1);
  }
}

// Run the deployment if this file is executed directly
if (require.main === module) {
  deployActions();
} 