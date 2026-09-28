// lib/monitoring.js
// Équivalent provisoire de monitoring/sentry.js : simple console.error
// en attendant l'installation de @sentry/react-native.

export const captureClientError = (
  error,
  component,
  action,
  isCritical = false,
) => {
  console.error(
    `[${component}.${action}]${isCritical ? " (critique)" : ""}`,
    error?.message || error,
  );
};

export default { captureClientError };
