export const API_BASED_URL =
  import.meta.env.VITE_USE_MOCK === "true"
    ? "http://localhost:8080"
    : "http:actual-backend-url";

   