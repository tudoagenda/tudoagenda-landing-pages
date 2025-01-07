type CreateUserResponse = {
  message: string;
  user: string;
};

export const userService = {
  async createUser(email: string): Promise<CreateUserResponse> {
    const response = await fetch("/agendabela/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error occurred! status: ${response.status}`);
    }

    return response.json();
  },
};
