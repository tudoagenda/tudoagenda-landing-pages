export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
  salonName: string;
  phone: string;
}

export interface CreateBillingParams {
  email: string;
  name: string;
  phone: string;
}

type CreateUserResponse = {
  success: boolean;
  profileId?: string;
  message?: string;
};

type CreateBillingResponse = {
  url: string;
};

export const userService = {
  async createUser(params: CreateUserParams): Promise<CreateUserResponse> {
    const response = await fetch(`/api/agendabela/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async sendMagicLink(phone: string, email: string): Promise<{ sent: boolean }> {
    const response = await fetch(`/api/agendabela/send-magic-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async createBilling(params: CreateBillingParams): Promise<CreateBillingResponse> {
    const response = await fetch(`/api/agendabela/create-billing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
