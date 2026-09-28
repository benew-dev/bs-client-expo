// context/CartContext.js
// Équivalent mobile de CartContext.js (version Better Auth) :
// mêmes fonctions, appels vers /api/v1/cart avec le cookie de session.

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "expo-router";
import { DECREASE, INCREASE } from "../helpers/constants";
import { captureClientError } from "../lib/monitoring";
import { showToast } from "../lib/toast";
import { authenticatedFetch, useSession } from "../lib/auth-client";

const CartContext = createContext();

const REQUEST_TIMEOUT = 10000;
const PROTECTED_PATHS = ["/cart", "/payment", "/me", "/shipping"];

// Appel authentifié (cookie Better Auth) avec timeout
const cartFetch = async (path, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await authenticatedFetch(path, {
      ...options,
      headers: { Accept: "application/json", ...(options.headers || {}) },
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const CartProvider = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [error, setError] = useState(null);

  // Flags pour éviter les chargements multiples
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const wasLoggedInRef = useRef(false);

  // Charger le panier automatiquement quand la session est disponible
  useEffect(() => {
    if (session?.user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      wasLoggedInRef.current = true;
      setCartToState();
    } else if (!session?.user) {
      // Réinitialiser quand l'utilisateur se déconnecte
      clearCartOnLogout();
      hasLoadedRef.current = false;

      // Si l'utilisateur était connecté, sur une page protégée : retour au login
      if (wasLoggedInRef.current) {
        wasLoggedInRef.current = false;

        const currentPath = pathnameRef.current || "/";
        if (PROTECTED_PATHS.some((path) => currentPath.startsWith(path))) {
          router.replace({
            pathname: "/login",
            params: { callbackUrl: currentPath },
          });
        }
      }
    }
  }, [session?.user?.id]);

  // Récupérer le panier
  const setCartToState = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!session?.user) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      const { res, data } = await cartFetch("/api/v1/cart", { method: "GET" });

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter";
            break;
          case 429:
            errorMessage = "Trop de tentatives. Réessayez plus tard.";
            break;
          default:
            errorMessage =
              data.message || "Erreur lors de la récupération du panier";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "CartContext",
          "setCartToState",
          res.status === 401,
        );

        setError(errorMessage);
        return;
      }

      if (data.success) {
        remoteDataInState(data);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setError("La requête a pris trop de temps");
        captureClientError(error, "CartContext", "setCartToState", false);
      } else {
        setError("Problème de connexion. Vérifiez votre connexion.");
        captureClientError(error, "CartContext", "setCartToState", true);
      }
      console.error("Cart retrieval error:", error.message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [session?.user]);

  // Ajouter au panier
  const addItemToCart = async ({ product, quantity = 1 }) => {
    if (!session?.user) {
      showToast("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    try {
      if (!product) {
        captureClientError(
          new Error("Produit invalide"),
          "CartContext",
          "addItemToCart",
          false,
        );
        showToast("Produit invalide");
        return;
      }

      setLoading(true);
      setError(null);

      const { res, data } = await cartFetch("/api/v1/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product,
          quantity: parseInt(quantity, 10),
        }),
      });

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 400:
            errorMessage = data.message || "Stock insuffisant";
            break;
          case 401:
            errorMessage = "Veuillez vous connecter";
            break;
          case 409:
            errorMessage = "Produit déjà dans le panier";
            break;
          default:
            errorMessage = data.message || "Erreur lors de l'ajout";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "CartContext",
          "addItemToCart",
          res.status === 401,
        );

        showToast(errorMessage);
        return;
      }

      if (data.success) {
        await setCartToState();
        showToast("Produit ajouté au panier");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        showToast("La connexion est trop lente");
        captureClientError(error, "CartContext", "addItemToCart", false);
      } else {
        showToast("Problème de connexion");
        captureClientError(error, "CartContext", "addItemToCart", true);
      }
      console.error("Add to cart error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour la quantité
  const updateCart = async (product, action) => {
    if (!session?.user) {
      showToast("Veuillez vous connecter");
      return;
    }

    try {
      if (!product?.id || ![INCREASE, DECREASE].includes(action)) {
        captureClientError(
          new Error("Données invalides pour mise à jour panier"),
          "CartContext",
          "updateCart",
          false,
        );
        showToast("Données invalides");
        return;
      }

      if (action === DECREASE && product.quantity === 1) {
        showToast("Utilisez le bouton Supprimer pour retirer cet article");
        return;
      }

      setLoading(true);
      setError(null);

      const { res, data } = await cartFetch("/api/v1/cart", {
        method: "PUT",
        body: JSON.stringify({ product, value: action }),
      });

      if (!res.ok) {
        const errorMessage = data.message || "Erreur de mise à jour";

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "CartContext",
          "updateCart",
          res.status === 401,
        );

        showToast(errorMessage);
        return;
      }

      if (data.success) {
        await setCartToState();
        showToast(
          action === INCREASE ? "Quantité augmentée" : "Quantité diminuée",
        );
      }
    } catch (error) {
      if (error.name === "AbortError") {
        showToast("La connexion est trop lente");
        captureClientError(error, "CartContext", "updateCart", false);
      } else {
        showToast("Problème de connexion");
        captureClientError(error, "CartContext", "updateCart", true);
      }
      console.error("Update cart error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer du panier
  const deleteItemFromCart = async (id) => {
    if (!session?.user) {
      showToast("Veuillez vous connecter");
      return;
    }

    try {
      if (!id) {
        captureClientError(
          new Error("ID invalide pour suppression panier"),
          "CartContext",
          "deleteItemFromCart",
          false,
        );
        showToast("ID invalide");
        return;
      }

      setLoading(true);
      setError(null);

      const { res, data } = await cartFetch(`/api/v1/cart/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorMessage = data.message || "Erreur de suppression";

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "CartContext",
          "deleteItemFromCart",
          [401, 404].includes(res.status),
        );

        showToast(errorMessage);
        return;
      }

      if (data.success) {
        await setCartToState();
        showToast("Article supprimé");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        showToast("La connexion est trop lente");
        captureClientError(error, "CartContext", "deleteItemFromCart", false);
      } else {
        showToast("Problème de connexion");
        captureClientError(error, "CartContext", "deleteItemFromCart", true);
      }
      console.error("Delete cart item error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearCartOnLogout = () => {
    setCart([]);
    setLoading(false);
    setCartCount(0);
    setCartTotal(0);
  };

  const remoteDataInState = (response) => {
    try {
      const normalizedCart =
        response.data.cart?.map((item) => ({
          ...item,
          quantity: parseInt(item.quantity, 10) || 1,
        })) || [];

      setCart(normalizedCart);
      setCartCount(response.data.cartCount || 0);
      setCartTotal(response.data.cartTotal || 0);
    } catch (error) {
      captureClientError(error, "CartContext", "remoteDataInState", true);
      console.error("Error normalizing cart data:", error.message);

      setCart([]);
      setCartCount(0);
      setCartTotal(0);
    }
  };

  const contextValue = useMemo(
    () => ({
      loading,
      cart,
      cartCount,
      cartTotal,
      error,
      setCartToState,
      addItemToCart,
      updateCart,
      deleteItemFromCart,
      clearError,
      clearCartOnLogout,
    }),
    [loading, cart, cartCount, cartTotal, error, setCartToState],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartContext;
