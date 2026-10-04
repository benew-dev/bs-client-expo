// helpers/helpers.js
// Portage mobile de helpers/helpers.js (web).
// Omis volontairement : getCookieName et parseCallbackUrl, spécifiques aux
// cookies du web (NextAuth-era) / à Next.js — sans objet côté Expo
// (voir lib/auth-client.js pour la gestion du cookie côté mobile).

export const isArrayEmpty = (array) => {
  return !Array.isArray(array) || array.length === 0;
};

export const formatPrice = (value, currency = "Fdj", decimals = 2) => {
  const numValue = typeof value === "number" ? value : parseFloat(value);
  const amount = isNaN(numValue) ? 0 : numValue;
  return `${currency} ${amount.toFixed(decimals)}`;
};

export const truncateString = (str, length = 50) => {
  if (!str || typeof str !== "string") return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (date, options = {}, locale = "fr-FR") => {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
};

export const debounce = (func, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export const isEmptyObject = (obj) => {
  if (!obj || typeof obj !== "object") return true;
  return Object.keys(obj).length === 0;
};

export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
};

export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const safeValue = (value, defaultValue = "") => {
  return value === undefined || value === null ? defaultValue : value;
};
