import { http, HttpResponse } from "msw";

const BASE_URL = process.env.NEXT_PUBLIC_ENVIRONMENT_URL;

export const successHandler = http.post(
  `${BASE_URL}/agendabela/api/create-user`,
  () => {
    return HttpResponse.json(
      {
        message: "User created",
        user: "test@example.com",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  }
);

export const errorHandler = http.post(
  `${BASE_URL}/agendabela/api/create-user`,
  () => {
    return HttpResponse.json(
      {
        message: "User creation failed",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
);
