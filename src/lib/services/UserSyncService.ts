import { Auth0ManagementService } from './Auth0ManagementService';
import { directus } from '../directus';
import { updateUser, readUsers } from '@directus/sdk';
import { ApiTrackingService, ApiSource } from './ApiTrackingService';

export class UserSyncService {
  private apiTracker: ApiTrackingService | null = null;

  constructor(private auth0ManagementService: Auth0ManagementService) {
    this.initializeApiTracker();
  }

  private async initializeApiTracker() {
    this.apiTracker = await ApiTrackingService.getInstance();
  }

  private async trackApiCall() {
    await this.apiTracker?.trackApiCall(ApiSource.DIRECTUS_SDK);
  }

  async syncUserRoles(email: string, directusUserId: string): Promise<void> {
    try {
      // Get current Directus user details
      await this.trackApiCall();
      const currentDirectusUser = await directus.request(
        readUsers({
          filter: { id: { _eq: directusUserId } },
          fields: ['id', 'email', 'role']
        })
      );

      if (!currentDirectusUser?.[0]) {
        console.error('User not found in Directus:', directusUserId);
        return;
      }

      console.log('Directus: Current user role:', {
        userId: directusUserId,
        email,
        currentRole: currentDirectusUser[0].role
      });

      // Get user details from Auth0 including roles
      const { auth0User, auth0Roles, directusRoleId } = 
        await this.auth0ManagementService.getFullUserDetails(email);

      if (!auth0User) {
        console.error('User not found in Auth0:', email);
        return;
      }

      // Log the roles for debugging
      console.log('Role sync details:', {
        email,
        directusUserId,
        auth0Roles: auth0Roles.map(r => r.name),
        hasAuth0Roles: auth0Roles.length > 0,
        currentDirectusRole: currentDirectusUser[0].role,
        newDirectusRole: directusRoleId
      });

      if (!directusRoleId) {
        console.error('No role mapping found and no default role available for user:', email);
        return;
      }

      // Always update the role if it's different from the current one
      if (directusRoleId !== currentDirectusUser[0].role) {
        // Update the user's role in Directus
        await this.trackApiCall();
        await directus.request(
          updateUser(directusUserId, {
            role: directusRoleId
          })
        );

        // Get updated Directus user details
        await this.trackApiCall();
        const updatedDirectusUser = await directus.request(
          readUsers({
            filter: { id: { _eq: directusUserId } },
            fields: ['id', 'email', 'role']
          })
        );

        console.log('Directus: Role updated successfully:', {
          userId: directusUserId,
          email,
          oldRole: currentDirectusUser[0].role,
          newRole: updatedDirectusUser[0].role,
          auth0Roles: auth0Roles.map(r => r.name),
          wasDefaulted: auth0Roles.length === 0
        });
      } else {
        console.log('Roles already in sync:', {
          userId: directusUserId,
          email,
          role: currentDirectusUser[0].role,
          auth0Roles: auth0Roles.map(r => r.name),
          isDefaultRole: auth0Roles.length === 0
        });
      }
    } catch (error) {
      console.error('Sync Service: Error syncing user roles:', error);
      throw error;
    }
  }
} 