// components/profile/UpdatePassword.js
// Équivalent mobile de UpdatePassword.jsx.
// DOMPurify (sanitize XSS côté web) omis : pas de innerHTML/rendu HTML côté
// natif, donc pas de surface XSS équivalente sur ces champs texte.

import { useCallback, useContext, useEffect, useState } from "react";
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
import AuthContext from "../../context/AuthContext";
import { showToast } from "../../lib/toast";

const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  score += Math.min(password.length * 4, 40);
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^a-zA-Z\d]/.test(password)) score += 15;

  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars, 15);

  if (/(123456|password|qwerty|abc123)/i.test(password)) score -= 20;
  if (/(.)\1{2,}/.test(password)) score -= 10;

  return Math.max(0, Math.min(score, 100));
};

const getPasswordStrengthInfo = (strength) => {
  if (strength < 30)
    return { label: "Faible", color: "bg-red-500", text: "text-red-600" };
  if (strength < 60)
    return { label: "Moyen", color: "bg-yellow-500", text: "text-yellow-600" };
  if (strength < 80)
    return { label: "Bon", color: "bg-blue-500", text: "text-blue-600" };
  return { label: "Fort", color: "bg-green-500", text: "text-green-600" };
};

const RequirementRow = ({ met, label }) => (
  <View className="mb-1 flex-row items-center">
    <Ionicons
      name={met ? "checkmark-circle" : "close-circle-outline"}
      size={14}
      color={met ? "#16a34a" : "#9ca3af"}
    />
    <Text
      className={`ml-1 text-xs ${met ? "text-green-600" : "text-gray-500"}`}
    >
      {label}
    </Text>
  </View>
);

const UpdatePassword = () => {
  const { error, updatePassword, clearErrors } = useContext(AuthContext);
  const router = useRouter();

  const [formState, setFormState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [confirmError, setConfirmError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (error) {
      showToast(error);
      clearErrors();
      setIsSubmitting(false);
    }
  }, [error, clearErrors]);

  const handleChange = useCallback((field, value) => {
    setFormState((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "newPassword" || field === "confirmPassword") {
        if (next.confirmPassword.length > 0) {
          setConfirmError(
            next.newPassword !== next.confirmPassword
              ? "Les mots de passe ne correspondent pas"
              : null,
          );
        } else {
          setConfirmError(null);
        }
      }

      return next;
    });

    if (field === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  }, []);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const submitHandler = async () => {
    setIsSubmitting(true);

    try {
      await updatePassword({
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword,
        confirmPassword: formState.confirmPassword,
      });

      // Si updatePassword a défini une erreur, l'effect ci-dessus l'affichera
      // et remettra isSubmitting à false ; on ne sait donc pas ici si ça a
      // réussi. On réinitialise par prudence, comme le ferait un succès.
      showToast("Mot de passe mis à jour avec succès");

      setFormState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setConfirmError(null);

      setTimeout(() => router.replace("/me"), 1000);
    } catch (error) {
      console.error("Password update error:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthInfo = getPasswordStrengthInfo(passwordStrength);
  const canSubmit = !isSubmitting && !confirmError;

  const inputClass = (hasError) =>
    `rounded-md border px-3 py-2 pr-10 text-gray-900 ${
      hasError ? "border-red-500 bg-red-50" : "border-gray-200 bg-gray-100"
    }`;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="mb-8 rounded-lg bg-white p-4 shadow-sm">
        <Pressable
          onPress={() => router.back()}
          className="mb-4 flex-row items-center self-start rounded-md border border-gray-300 bg-white px-3 py-2 active:bg-gray-50"
        >
          <Ionicons name="arrow-back" size={16} color="#374151" />
          <Text className="ml-2 text-sm font-medium text-gray-700">Retour</Text>
        </Pressable>

        <Text className="mb-5 text-2xl font-semibold">
          Modifier votre mot de passe
        </Text>

        {/* Mot de passe actuel */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-gray-700">
            Mot de passe actuel <Text className="text-red-500">*</Text>
          </Text>
          <View className="relative justify-center">
            <TextInput
              className={inputClass(false)}
              placeholder="Saisissez votre mot de passe actuel"
              placeholderTextColor="#9ca3af"
              value={formState.currentPassword}
              onChangeText={(v) => handleChange("currentPassword", v)}
              secureTextEntry={!showPassword.current}
              editable={!isSubmitting}
              accessibilityLabel="Mot de passe actuel"
            />
            <Pressable
              onPress={() => togglePasswordVisibility("current")}
              className="absolute right-3"
              accessibilityLabel={
                showPassword.current
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              <Ionicons
                name={showPassword.current ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#4b5563"
              />
            </Pressable>
          </View>
        </View>

        {/* Nouveau mot de passe */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-gray-700">
            Nouveau mot de passe <Text className="text-red-500">*</Text>
          </Text>
          <View className="relative justify-center">
            <TextInput
              className={inputClass(false)}
              placeholder="Créez un nouveau mot de passe fort"
              placeholderTextColor="#9ca3af"
              value={formState.newPassword}
              onChangeText={(v) => handleChange("newPassword", v)}
              secureTextEntry={!showPassword.new}
              editable={!isSubmitting}
              accessibilityLabel="Nouveau mot de passe"
            />
            <Pressable
              onPress={() => togglePasswordVisibility("new")}
              className="absolute right-3"
              accessibilityLabel={
                showPassword.new
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              <Ionicons
                name={showPassword.new ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#4b5563"
              />
            </Pressable>
          </View>

          <View className="mt-2">
            <RequirementRow
              met={formState.newPassword.length >= 8}
              label="Au moins 8 caractères"
            />
            <RequirementRow
              met={/[A-Z]/.test(formState.newPassword)}
              label="Au moins une lettre majuscule"
            />
            <RequirementRow
              met={/[a-z]/.test(formState.newPassword)}
              label="Au moins une lettre minuscule"
            />
            <RequirementRow
              met={/\d/.test(formState.newPassword)}
              label="Au moins un chiffre"
            />
            <RequirementRow
              met={/[@$!%*?&#]/.test(formState.newPassword)}
              label="Au moins un caractère spécial (@$!%*?&#)"
            />
          </View>

          {formState.newPassword ? (
            <View className="mt-2">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-gray-600">
                  Force du mot de passe :{" "}
                </Text>
                <Text className={`text-xs font-semibold ${strengthInfo.text}`}>
                  {strengthInfo.label}
                </Text>
              </View>
              <View className="h-2.5 w-full rounded-full bg-gray-200">
                <View
                  className={`h-2.5 rounded-full ${strengthInfo.color}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* Confirmation */}
        <View className="mb-6">
          <Text className="mb-2 font-medium text-gray-700">
            Confirmer le mot de passe <Text className="text-red-500">*</Text>
          </Text>
          <View className="relative justify-center">
            <TextInput
              className={inputClass(!!confirmError)}
              placeholder="Confirmez votre nouveau mot de passe"
              placeholderTextColor="#9ca3af"
              value={formState.confirmPassword}
              onChangeText={(v) => handleChange("confirmPassword", v)}
              secureTextEntry={!showPassword.confirm}
              editable={!isSubmitting}
              accessibilityLabel="Confirmer le mot de passe"
            />
            <Pressable
              onPress={() => togglePasswordVisibility("confirm")}
              className="absolute right-3"
              accessibilityLabel={
                showPassword.confirm
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              <Ionicons
                name={showPassword.confirm ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#4b5563"
              />
            </Pressable>
          </View>
          {confirmError && (
            <Text className="mt-1 text-sm text-red-600">{confirmError}</Text>
          )}
        </View>

        <Pressable
          onPress={submitHandler}
          disabled={!canSubmit}
          className={`mt-4 flex-row items-center justify-center rounded-md px-4 py-2 ${
            canSubmit ? "bg-blue-600 active:bg-blue-700" : "bg-blue-400"
          }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="ml-2 text-white">Mise à jour en cours...</Text>
            </>
          ) : (
            <Text className="text-white">Mettre à jour le mot de passe</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default UpdatePassword;
