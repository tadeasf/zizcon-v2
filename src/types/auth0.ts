import { ManagementClient } from 'auth0';
import { ActionsManager } from 'auth0';

export interface Auth0Action {
  id: string;
  name: string;
  code: string;
  runtime?: string;
  dependencies: Array<{ name: string; version: string }>;
  secrets?: Array<{ name: string; value: string }>;
  supported_triggers: Array<{
    id: string;
    version: string;
    status?: string;
  }>;
  created_at?: string;
  updated_at?: string;
  current_version?: {
    id: string;
    runtime: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  deployed_version?: {
    id: string;
    runtime: string;
    status: string;
    created_at: string;
    updated_at: string;
    code: string;
    dependencies: Array<{ name: string; version: string }>;
    deployed: boolean;
    secrets: Array<{ name: string; value: string }>;
  };
  all_changes_deployed?: boolean;
  status?: string;
}

export interface Auth0ActionResponse {
  id: string;
  name: string;
  code: string;
  runtime?: string;
  dependencies: Array<{ name: string; version: string }>;
  secrets?: Array<{ name: string; value: string }>;
  supported_triggers: Array<{
    id: string;
    version: string;
  }>;
  current_version?: {
    id: string;
    runtime: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Auth0Flow {
  trigger_id: string;
  bindings: Array<{
    action_name?: string;
    display_name?: string;
    ref?: {
      type: string;
      value: string;
    };
  }>;
}

export interface Auth0ActionVersion {
  id: string;
  code: string;
  runtime: string;
  status: string;
  created_at: string;
  updated_at: string;
  dependencies?: Array<{ name: string; version: string }>;
  secrets?: Array<{ name: string; value: string }>;
  deployed?: boolean;
}

export interface Auth0TriggerBinding {
  id?: string;
  trigger_id?: string;
  display_name: string;
  action?: {
    id: string;
    name: string;
  };
  ref?: {
    type: string;
    value: string;
  };
}

export interface Auth0ActionClient extends ManagementClient {
  actions: ActionsManager & {
    getAll: (params?: { actionName?: string }) => Promise<{ data: { actions: Auth0Action[] } }>;
    get: (params: { id: string }) => Promise<{ data: Auth0Action & { current_version?: { id: string } } }>;
    getVersions: (params: { actionId: string }) => Promise<{ data: { versions: Auth0ActionVersion[] } }>;
    create: (data: Partial<Auth0Action>) => Promise<Auth0ActionResponse>;
    update: (params: { id: string }, data: Partial<Auth0Action>) => Promise<Auth0ActionResponse>;
    delete: (params: { id: string }) => Promise<void>;
    deploy: (params: { id: string }) => Promise<void>;
    getTriggerBindings: (params: { triggerId: string }) => Promise<{ data: { bindings: Auth0TriggerBinding[] } }>;
    updateTriggerBindings: (params: { triggerId: string }, data: { bindings: Auth0TriggerBinding[] }) => Promise<void>;
  };
} 