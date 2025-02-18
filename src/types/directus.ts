export interface DirectusUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  password: string | null;
  location: string | null;
  title: string | null;
  description: string | null;
  tags: string[] | null;
  avatar: string | null;
  language: string | null;
  theme: string | null;
  tfa_secret: string | null;
  status: string;
  role: string;
  token: string | null;
  last_access: 'datetime' | null;
  last_page: string | null;
  provider: string;
  external_identifier: string;
  auth_data: Record<string, unknown>;
  email_notifications: boolean;
  stripe_customer_id?: string | null;
} 