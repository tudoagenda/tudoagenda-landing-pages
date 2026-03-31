import { http, HttpResponse } from "msw";

export const successHandler = http.post(
  "http://localhost/api/agendabela/create-user",
  () => {
    return HttpResponse.json(
      {
        success: true,
        profileId: "profile-123",
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
  "http://localhost/api/agendabela/create-user",
  () => {
    return HttpResponse.json(
      {
        error: "User creation failed",
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

export const sendMagicLinkSuccessHandler = http.post(
  "http://localhost/api/agendabela/send-magic-link",
  () => {
    return HttpResponse.json(
      { sent: true },
      { status: 200 }
    );
  }
);

export const sendMagicLinkErrorHandler = http.post(
  "http://localhost/api/agendabela/send-magic-link",
  () => {
    return HttpResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
);
