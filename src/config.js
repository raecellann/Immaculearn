const config = {
  APIKEY: import.meta.env.VITE_APIKEY,
  APP_URL: import.meta.env.VITE_APP_URL,
  VITE_ENV: import.meta.env.VITE_ENV,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  API_URL:
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_API_URL
      : "http://localhost:3000/v1",
  //   API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
};

export default config;
