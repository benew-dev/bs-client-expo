// components/auth/Login.js
// Équivalent mobile de Login.jsx.

import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { validateLogin } from "../../helpers/validation/schemas/auth";
import { captureClientError } from "../../lib/monitoring";
import { authClient, signIn } from "../../lib/auth-client";
import { showToast } from "../../lib/toast";

// N'accepte que les chemins internes de l'app (équivalent minimal de parseCallbackUrl)
const getSafeCallbackUrl = (value) => {
  const url = Array.isArray(value) ? value[0] : value;
  if (typeof url === "string" && url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }
  return "/";
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const router = useRouter();
  const params = useLocalSearchParams();
  const callbackUrl = getSafeCallbackUrl(params.callbackUrl);

  const submitHandler = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Validation des données avant envoi
      const validationResult = await validateLogin({
        email: email || "",
        password: password || "",
      });

      if (!validationResult.isValid) {
        setErrors(validationResult.errors || {});
        showToast("Veuillez corriger les erreurs dans le formulaire.");
        return;
      }

      setErrors({});

      // Connexion avec Better Auth
      // (email nettoyé par Yup : les claviers mobiles ajoutent souvent une espace finale)
      const { data, error } = await signIn.email({
        email: validationResult.data.email,
        password,
      });

      if (error) {
        showToast(error.message || "Échec de connexion");
        return;
      }

      if (data) {
        // Bug connu de Better Auth sur Expo (issues #3711, #1006, #8420) :
        // useSession() ne se met pas toujours à jour tout seul après signIn.
        // On force un refetch explicite pour que le Header (et le panier)
        // voient l'utilisateur connecté sans attendre
        try {
          await authClient.getSession({ query: { disableCookieCache: true } });
        } catch (refreshError) {
          console.error("Session refresh error:", refreshError.message);
        }

        showToast("Connexion réussie!");
        router.replace(callbackUrl);
      }
    } catch (error) {
      captureClientError(error, "Login", "technicalError", true);
      console.error("Login error:", error);
      showToast("Un problème est survenu. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-10 mt-4 rounded-lg bg-white p-4">
        {/* Champ email */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Email</Text>
          <TextInput
            className={`rounded-md border bg-gray-100 px-3 py-2 text-base text-gray-900 ${
              errors.email ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Votre adresse email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!isLoading}
            accessibilityLabel="Email"
          />
          {errors.email && (
            <Text className="mt-1 text-xs text-red-600">{errors.email}</Text>
          )}
        </View>

        {/* Champ mot de passe */}
        <View className="mb-6">
          <Text className="mb-1 font-medium text-gray-700">Mot de passe</Text>
          <TextInput
            className={`rounded-md border bg-gray-100 px-3 py-2 text-base text-gray-900 ${
              errors.password ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Votre mot de passe"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            editable={!isLoading}
            onSubmitEditing={submitHandler}
            accessibilityLabel="Mot de passe"
          />
          {errors.password && (
            <Text className="mt-1 text-xs text-red-600">{errors.password}</Text>
          )}
        </View>

        {/* Lien mot de passe oublié */}
        <View className="mb-4 items-end">
          <Pressable onPress={() => router.push("/forgot-password")}>
            <Text className="text-sm text-blue-600">Mot de passe oublié?</Text>
          </Pressable>
        </View>

        {/* Bouton de connexion */}
        <Pressable
          onPress={submitHandler}
          disabled={isLoading}
          accessibilityState={{ busy: isLoading }}
          className={`my-2 flex-row items-center justify-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700 ${
            isLoading ? "opacity-70" : ""
          }`}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="ml-2 text-white">Connexion en cours...</Text>
            </>
          ) : (
            <Text className="text-white">Se connecter</Text>
          )}
        </Pressable>

        <View className="mb-5 mt-6 border-t border-gray-200" />

        {/* Lien d'inscription */}
        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-gray-600">
            Vous n&apos;avez pas de compte?{" "}
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text className="font-semibold text-blue-600">S&apos;inscrire</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
