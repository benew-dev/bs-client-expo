// components/auth/Register.js
// Équivalent mobile de Register.jsx.

import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { validateRegister } from "../../helpers/validation/schemas/auth";
import { captureClientError } from "../../lib/monitoring";
import { signUp } from "../../lib/auth-client";
import { showToast } from "../../lib/toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  // Calcul de la force du mot de passe (0-100)
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let score = 0;

    // Longueur (max 25 points)
    score += Math.min(password.length * 2.5, 25);

    // Complexité (max 75 points)
    if (/[A-Z]/.test(password)) score += 15; // Majuscules
    if (/[a-z]/.test(password)) score += 10; // Minuscules
    if (/[0-9]/.test(password)) score += 15; // Chiffres
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Caractères spéciaux
    if (/(.)\1\1/.test(password)) score -= 10; // Répétitions (pénalité)

    // Variété des caractères (max 15 points supplémentaires)
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 1.5, 15);

    setPasswordStrength(Math.max(0, Math.min(100, score)));
  };

  // Mise à jour des champs du formulaire
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Nettoyer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === "password") {
      try {
        calculatePasswordStrength(value);
      } catch (error) {
        captureClientError(
          error,
          "Register",
          "passwordStrengthCalculation",
          false,
        );
      }
    }
  };

  // Soumission du formulaire
  const submitHandler = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validation Yup côté client
      const validation = await validateRegister(formData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        showToast(Object.values(validation.errors)[0]);
        return;
      }

      // Inscription avec Better Auth
      // (nom, email et téléphone nettoyés par Yup ; mot de passe envoyé tel quel)
      const { data, error } = await signUp.email({
        email: validation.data.email,
        password: formData.password,
        name: validation.data.name,
        phone: validation.data.phone,
      });

      if (error) {
        let errorMessage = "Erreur lors de l'inscription";

        if (error.message) {
          if (
            error.message.toLowerCase().includes("duplicate") ||
            error.message.toLowerCase().includes("already exists")
          ) {
            errorMessage =
              "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.";
          } else if (error.message.toLowerCase().includes("validation")) {
            errorMessage =
              "Données invalides. Veuillez vérifier vos informations.";
          } else {
            errorMessage = error.message;
          }
        }

        showToast(errorMessage);
        captureClientError(
          new Error(`Erreur serveur lors de l'inscription: ${error.message}`),
          "Register",
          "serverError",
          true,
        );
        return;
      }

      if (data) {
        showToast("Inscription réussie !");

        // Redirection vers login après un court délai
        setTimeout(() => router.replace("/login"), 1500);
      }
    } catch (error) {
      captureClientError(error, "Register", "technicalError", true);
      console.error("Registration error:", error);
      showToast("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColor =
    passwordStrength < 30
      ? "bg-red-500"
      : passwordStrength < 60
        ? "bg-yellow-500"
        : "bg-green-500";
  const strengthText =
    passwordStrength < 30 ? "Faible" : passwordStrength < 60 ? "Moyen" : "Fort";

  const inputClass = (field) =>
    `rounded-md border bg-gray-50 px-3 py-2 text-base text-gray-900 ${
      errors[field] ? "border-red-500" : "border-gray-200"
    }`;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-16 mt-2 rounded-lg bg-white p-4">
        {/* Nom */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">
            Nom complet <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={inputClass("name")}
            placeholder="Votre nom complet"
            placeholderTextColor="#9ca3af"
            value={formData.name}
            onChangeText={(v) => handleChange("name", v)}
            editable={!isSubmitting}
            autoComplete="name"
            accessibilityLabel="Nom complet"
          />
          {errors.name && (
            <Text className="mt-1 text-xs text-red-600">{errors.name}</Text>
          )}
        </View>

        {/* Téléphone */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">
            Numéro de téléphone <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={inputClass("phone")}
            placeholder="Votre numéro de téléphone"
            placeholderTextColor="#9ca3af"
            value={formData.phone}
            onChangeText={(v) => handleChange("phone", v)}
            keyboardType="phone-pad"
            editable={!isSubmitting}
            autoComplete="tel"
            accessibilityLabel="Numéro de téléphone"
          />
          {errors.phone && (
            <Text className="mt-1 text-xs text-red-600">{errors.phone}</Text>
          )}
          <Text className="mt-1 text-xs text-gray-500">
            Format: numéro valide (ex: +25377123456)
          </Text>
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">
            Email <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={inputClass("email")}
            placeholder="Votre adresse email"
            placeholderTextColor="#9ca3af"
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            autoComplete="email"
            accessibilityLabel="Email"
          />
          {errors.email && (
            <Text className="mt-1 text-xs text-red-600">{errors.email}</Text>
          )}
        </View>

        {/* Mot de passe */}
        <View className="mb-6">
          <Text className="mb-1 font-medium text-gray-700">
            Mot de passe <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={inputClass("password")}
            placeholder="Créez un mot de passe sécurisé"
            placeholderTextColor="#9ca3af"
            value={formData.password}
            onChangeText={(v) => handleChange("password", v)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            autoComplete="new-password"
            accessibilityLabel="Mot de passe"
          />
          {errors.password && (
            <Text className="mt-1 text-xs text-red-600">{errors.password}</Text>
          )}

          {/* Indicateur de force du mot de passe */}
          {formData.password ? (
            <View className="mt-2">
              <View className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <View
                  className={`h-full ${strengthColor}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-xs text-gray-600">
                  Force du mot de passe: {strengthText}
                </Text>
                <Text className="text-xs text-gray-600">
                  {passwordStrength}/100
                </Text>
              </View>
            </View>
          ) : null}

          <Text className="mt-2 text-xs text-gray-500">
            Au moins 8 caractères avec majuscules, minuscules, chiffres et
            caractères spéciaux
          </Text>
        </View>

        {/* Conditions d'utilisation (non bloquant, comme sur le web) */}
        <View className="mb-6 flex-row items-start">
          <Pressable
            onPress={() => setAcceptedTerms((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            accessibilityLabel="J'accepte les conditions d'utilisation"
          >
            <Ionicons
              name={acceptedTerms ? "checkbox" : "square-outline"}
              size={22}
              color={acceptedTerms ? "#2563eb" : "#9ca3af"}
            />
          </Pressable>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-gray-700">
              J&apos;accepte les conditions d&apos;utilisation
            </Text>
            <Text className="text-sm text-gray-500">
              En créant un compte, vous acceptez nos{" "}
              <Text
                className="text-blue-600"
                onPress={() => router.push("/terms")}
              >
                conditions d&apos;utilisation
              </Text>{" "}
              et notre{" "}
              <Text
                className="text-blue-600"
                onPress={() => router.push("/privacy")}
              >
                politique de confidentialité
              </Text>
            </Text>
          </View>
        </View>

        {/* Bouton de soumission */}
        <Pressable
          onPress={submitHandler}
          disabled={isSubmitting}
          className={`flex-row items-center justify-center rounded-md bg-blue-600 px-4 py-3 active:bg-blue-700 ${
            isSubmitting ? "opacity-70" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="ml-2 text-white">Création en cours...</Text>
            </>
          ) : (
            <Text className="text-white">Créer mon compte</Text>
          )}
        </Pressable>

        <View className="my-6 border-t border-gray-200" />

        <View className="flex-row flex-wrap items-center justify-center">
          <Text className="text-gray-600">Vous avez déjà un compte ? </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text className="font-semibold text-blue-600">Se connecter</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;
