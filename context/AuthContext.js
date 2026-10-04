// context/AuthContext.js
// Équivalent mobile de AuthContext.jsx.
//
// updatePassword : suit le web, qui appelle désormais directement l'API
// native de Better Auth (authClient.changePassword) plutôt que la route
// personnalisée /api/v1/auth/me/update_password construite précédemment.
// À trancher quand on construira l'écran /me/update_password : garder cette
// route v1 (verrouillage de compte, Yup) ou la remplacer par cet appel natif.

import { createContext, useState } from "react";
import { useRouter } from "expo-router";
import { showToast } from "../lib/toast";
import { captureClientError } from "../lib/monitoring";
import {
  authClient,
  authenticatedFetch,
  changePassword as authChangePassword,
} from "../lib/auth-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const router = useRouter();

  /**
   * Met à jour le profil utilisateur (phone + adresse) via /api/v1/auth/me/update
   */
  const updateProfile = async ({ phone, address }) => {
    try {
      setLoading(true);
      setError(null);

      const payload = { phone: phone.trim(), address };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await authenticatedFetch("/api/v1/me/update", {
        method: "PUT",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 400:
            if (data.errors) {
              const firstErrorKey = Object.keys(data.errors)[0];
              errorMessage =
                data.errors[firstErrorKey] || "Données de profil invalides";
            } else {
              errorMessage = data.message || "Données de profil invalides";
            }
            break;
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter";
            setTimeout(() => router.replace("/login"), 2000);
            break;
          case 429:
            errorMessage = "Trop de tentatives. Réessayez plus tard.";
            break;
          default:
            errorMessage = data.message || "Erreur lors de la mise à jour";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "AuthContext",
          "updateProfile",
          res.status === 401,
        );

        setError(errorMessage);
        return;
      }

      if (data.success && data.data?.updatedUser) {
        // /api/v1/me/update n'est pas une méthode native Better Auth : le
        // client ne resynchronise pas automatiquement son store de session.
        // Même correctif que pour le login (useSession() peu fiable sur
        // Expo) : forcer un vrai refetch, en contournant le cache.
        try {
          await authClient.getSession({ query: { disableCookieCache: true } });
        } catch (refreshError) {
          console.error("Session refresh error:", refreshError.message);
        }

        showToast("Profil mis à jour avec succès!");
        setUser(data.data.updatedUser);
        setUpdated(true);

        const sessionUpdated = res.headers.get("X-Session-Updated");
        return { success: true, sessionUpdated };
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setError("La requête a pris trop de temps");
        captureClientError(error, "AuthContext", "updateProfile", false);
      } else {
        setError("Problème de connexion. Vérifiez votre connexion.");
        captureClientError(error, "AuthContext", "updateProfile", true);
      }
      console.error("Profile update error:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour le mot de passe via l'API native Better Auth
   */
  const updatePassword = async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    try {
      setLoading(true);
      setError(null);

      if (!currentPassword || !newPassword) {
        setError("Tous les champs sont obligatoires");
        return;
      }

      if (currentPassword === newPassword) {
        setError("Le nouveau mot de passe doit être différent");
        return;
      }

      if (newPassword.length < 8) {
        setError("Minimum 8 caractères pour le nouveau mot de passe");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(
          "Le nouveau mot de passe et la confirmation ne correspondent pas",
        );
        return;
      }

      const { error: changeError } = await authChangePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (changeError) {
        const errorMessage =
          changeError.message || "Mot de passe actuel incorrect";
        const httpError = new Error(errorMessage);
        captureClientError(httpError, "AuthContext", "updatePassword", false);
        setError(errorMessage);
        return;
      }

      showToast("Mot de passe mis à jour avec succès!");
      setTimeout(() => router.replace("/me"), 1000);
    } catch (error) {
      setError("Problème de connexion. Vérifiez votre connexion.");
      captureClientError(error, "AuthContext", "updatePassword", true);
      console.error("Password update error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envoie un email de contact via /api/v1/emails
   */
  const sendEmail = async ({ subject, message }) => {
    try {
      setLoading(true);
      setError(null);

      if (!subject || !subject.trim()) {
        setError("Le sujet est obligatoire");
        return;
      }
      if (!message || !message.trim()) {
        setError("Le message est obligatoire");
        return;
      }
      if (subject.length > 200) {
        setError("Le sujet est trop long (max 200 caractères)");
        return;
      }
      if (message.length > 5000) {
        setError("Le message est trop long (max 5000 caractères)");
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await authenticatedFetch("/api/v1/emails", {
        method: "POST",
        body: JSON.stringify({ subject, message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let errorMessage = "";
        switch (res.status) {
          case 400:
            errorMessage = data.message || "Données invalides";
            break;
          case 401:
            errorMessage = "Session expirée. Veuillez vous reconnecter";
            setTimeout(() => router.replace("/login"), 2000);
            break;
          case 404:
            errorMessage = "Utilisateur non trouvé";
            break;
          case 429:
            errorMessage = "Trop de tentatives. Réessayez plus tard.";
            break;
          case 503:
            errorMessage = "Service d'email temporairement indisponible";
            break;
          default:
            errorMessage = data.message || "Erreur lors de l'envoi";
        }

        const httpError = new Error(`HTTP ${res.status}: ${errorMessage}`);
        captureClientError(
          httpError,
          "AuthContext",
          "sendEmail",
          [401, 503].includes(res.status),
        );

        setError(errorMessage);
        return;
      }

      if (data.success) {
        showToast("Message envoyé avec succès!");
        router.replace("/me");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setError("La requête a pris trop de temps");
        captureClientError(error, "AuthContext", "sendEmail", false);
      } else {
        setError("Problème de connexion. Vérifiez votre connexion.");
        captureClientError(error, "AuthContext", "sendEmail", true);
      }
      console.error("Email send error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
    setUpdated(false);
  };

  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loading,
        updated,
        setUpdated,
        setUser,
        setLoading,
        updateProfile,
        updatePassword,
        sendEmail,
        clearUser,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
