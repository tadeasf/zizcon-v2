import axios from 'axios';
import { ApiTrackingService, ApiSource } from './ApiTrackingService';

export interface Auth0Role {
  id: string;
  name: string;
  description?: string;
}

interface Auth0User {
  user_id: string;
  email: string;
  roles?: Auth0Role[];
}

interface Auth0RoleMapping {
  usr_customer_unpaid: string;
  usr_customer_paid: string;
  usr_org: string;
  usr_admin: string;
}

const AUTH0_ROLES: Auth0RoleMapping = {
  usr_customer_unpaid: 'rol_tFh4rCsyamZjBwGN',
  usr_customer_paid: 'rol_yaTMTaYL5aGVeDsQ',
  usr_org: 'rol_jyAjOJwZnWay2Pm1',
  usr_admin: 'rol_re1uBbI6Itzl2Kya'
};

const DIRECTUS_ROLES = {
  usr_admin: '4dc29c63-1fb9-4a38-8d3f-7f6fe710a5a3',
  usr_org: 'ec02ba93-98f6-4f77-9442-b211ef5adffe',
  usr_customer_unpaid: 'af0100fc-ff1b-403d-bced-14cdbbc0f13e',
  usr_customer_paid: '28aa8709-7ff3-4c6b-b276-af44536ed465',
  regular: 'ecd5f898-308d-4cb2-b6e2-f15b6c0d6089'
};

export class Auth0ManagementService {
  private token: string | null = null;
  private tokenExpiresAt: number = 0;
  private apiTracker: ApiTrackingService | null = null;

  constructor(
    private readonly domain: string,
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly audience: string
  ) {
    this.initializeApiTracker();
  }

  private async initializeApiTracker() {
    this.apiTracker = await ApiTrackingService.getInstance();
  }

  private async trackApiCall() {
    await this.apiTracker?.trackApiCall(ApiSource.AUTH0_MGMT_API);
  }

  private async ensureToken(): Promise<string> {
    // Check if token exists and is not expired (with 5 minute buffer)
    if (this.token && this.tokenExpiresAt > Date.now() + 300000) {
      return this.token;
    }

    try {
      await this.trackApiCall();
      const response = await axios({
        method: 'POST',
        url: `https://${this.domain}/oauth/token`,
        headers: { 'content-type': 'application/json' },
        data: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: this.audience,
          grant_type: 'client_credentials'
        }
      });

      const accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('No access token received');
      }

      this.token = accessToken;
      // Set token expiration (default to 24 hours if exp not provided)
      const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
      this.tokenExpiresAt = (decodedToken.exp || (Date.now() / 1000) + 86400) * 1000;

      return accessToken;
    } catch (error) {
      console.error('Error getting management token:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<Auth0User | null> {
    try {
      await this.trackApiCall();
      const token = await this.ensureToken();
      const response = await axios({
        method: 'GET',
        url: `https://${this.domain}/api/v2/users-by-email`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: { email }
      });

      if (!response.data || !response.data.length) {
        return null;
      }

      return response.data[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<Auth0Role[]> {
    try {
      await this.trackApiCall();
      const token = await this.ensureToken();
      const response = await axios({
        method: 'GET',
        url: `https://${this.domain}/api/v2/users/${userId}/roles`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user roles:', error);
      throw error;
    }
  }

  getDirectusRoleForAuth0Role(auth0RoleId: string): string | null {
    // Find the Auth0 role name from the mapping
    const [auth0RoleName] = Object.entries(AUTH0_ROLES).find(
      ([, id]) => id === auth0RoleId
    ) || [];

    if (!auth0RoleName) {
      return null;
    }

    // Get the corresponding Directus role ID
    return DIRECTUS_ROLES[auth0RoleName as keyof typeof DIRECTUS_ROLES] || null;
  }

  async getFullUserDetails(email: string): Promise<{
    auth0User: Auth0User | null;
    auth0Roles: Auth0Role[];
    directusRoleId: string | null;
  }> {
    try {
      const auth0User = await this.getUserByEmail(email);
      if (!auth0User) {
        console.log('Auth0: No user found for email:', email);
        return { auth0User: null, auth0Roles: [], directusRoleId: null };
      }

      const auth0Roles = await this.getUserRoles(auth0User.user_id);
      console.log('Auth0: User roles:', {
        userId: auth0User.user_id,
        email: auth0User.email,
        roles: auth0Roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description
        }))
      });
      
      if (auth0Roles.length === 0) {
        console.log('Auth0: User has no roles assigned, defaulting to regular role');
        return {
          auth0User,
          auth0Roles: [],
          directusRoleId: DIRECTUS_ROLES.regular
        };
      }

      // Get the highest priority role
      const priorityOrder = ['usr_admin', 'usr_org', 'usr_customer_paid', 'usr_customer_unpaid'];
      const userRoleIds = auth0Roles.map(role => role.id);
      
      let highestPriorityRole = null;
      for (const roleName of priorityOrder) {
        const roleId = AUTH0_ROLES[roleName as keyof Auth0RoleMapping];
        if (userRoleIds.includes(roleId)) {
          highestPriorityRole = roleId;
          console.log('Auth0: Highest priority role found:', {
            roleName,
            roleId,
            mappedDirectusRoleId: this.getDirectusRoleForAuth0Role(roleId)
          });
          break;
        }
      }

      const directusRoleId = highestPriorityRole 
        ? this.getDirectusRoleForAuth0Role(highestPriorityRole)
        : DIRECTUS_ROLES.regular;

      return {
        auth0User,
        auth0Roles,
        directusRoleId
      };
    } catch (error) {
      console.error('Error getting full user details:', error);
      throw error;
    }
  }
} 