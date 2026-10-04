// context/OrderContext.js
// Équivalent mobile de OrderContext.jsx. addOrder() n'est pas encore
// appelé depuis l'écran paiement (comme sur le web, qui le déclenche depuis
// /review-order, pas encore fourni) — porté ici pour que le contexte soit
// complet dès maintenant.

import { createContext, useState } from "react";
import { useRouter } from "expo-router";
import { captureClientError } from "../lib/monitoring";
import { authenticatedFetch } from "../lib/auth-client";

const OrderContext = createContext();

const ORDER_TIMEOUT = 30000; // 30s pour une commande, comme le web

export const OrderProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState(null);

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);

  const router = useRouter();

  const addOrder = async (orderInfoToSend) => {
    try {
      setError(null);
      setUpdated(true);
      setLowStockProducts(null);

      if (!orderInfoToSend) {
        captureClientError(
          new Error("Données de commande manquantes"),
          "OrderContext",
          "addOrder",
          false,
        );
        setError("Données de commande manquantes");
        setUpdated(false);
        return;
      }

      if (
        !orderInfoToSend.orderItems ||
        orderInfoToSend.orderItems.length === 0
      ) {
        captureClientError(
          new Error("Panier vide lors de la création de commande"),
          "OrderContext",
          "addOrder",
          false,
        );
        setError("Votre panier est vide");
        setUpdated(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ORDER_TIMEOUT);

      const res = await authenticatedFetch("/api/v1/orders/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(orderInfoToSend),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 400:
            errorMessage = data.message || "Données de commande invalides";
            break;
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter.";
            setTimeout(() => router.replace("/login"), 2000);
            break;
          case 404:
            errorMessage = "Utilisateur non trouvé";
            setTimeout(() => router.replace("/login"), 2000);
            break;
          case 409:
            // Produits indisponibles - cas spécial critique pour l'e-commerce
            if (data.unavailableProducts) {
              setLowStockProducts(data.unavailableProducts);
              errorMessage = "Produits indisponibles détectés";
              router.push("/error");
            } else {
              errorMessage = "Certains produits ne sont plus disponibles";
            }
            break;
          case 429:
            errorMessage = "Trop de tentatives. Réessayez plus tard.";
            break;
          default:
            errorMessage =
              data.message || "Erreur lors du traitement de la commande";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        const isCritical = [401, 404, 409].includes(res.status);
        captureClientError(httpError, "OrderContext", "addOrder", isCritical);

        setError(errorMessage);
        setUpdated(false);
        return;
      }

      if (data.success && data.id) {
        setOrderId(data.id);
        setError(null);
        // replace (et non push) : review-order reste sinon monté en arrière-
        // plan et réagit au panier qui se vide juste après, en redirigeant
        // par-dessus la confirmation (bug observé).
        router.replace("/confirmation");
      } else {
        captureClientError(
          new Error("Réponse API malformée lors de la création de commande"),
          "OrderContext",
          "addOrder",
          true,
        );
        setError("Erreur lors de la création de la commande");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setError("La requête a pris trop de temps. Veuillez réessayer.");
        captureClientError(error, "OrderContext", "addOrder", true);
      } else {
        setError("Problème de connexion. Vérifiez votre connexion.");
        captureClientError(error, "OrderContext", "addOrder", true);
      }
      console.error("Order creation error:", error.message);
    } finally {
      setUpdated(false);
    }
  };

  const clearErrors = () => {
    setError(null);
  };

  return (
    <OrderContext.Provider
      value={{
        error,
        updated,
        orderId,
        lowStockProducts,
        paymentTypes,
        orderInfo,
        setPaymentTypes,
        setOrderInfo,
        addOrder,
        setUpdated,
        clearErrors,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;
