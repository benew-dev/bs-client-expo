// lib/format.js

// Même formatage que le web ; try/catch par sécurité si Intl est limité sur l'appareil
export const formatPrice = (value) => {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "Fdj",
    }).format(value || 0);
  } catch {
    return `${value || 0} Fdj`;
  }
};

// React Native n'affiche pas de HTML : on retire les balises pour un texte brut
export const stripHtml = (value) => String(value ?? "").replace(/<[^>]*>/g, "");
