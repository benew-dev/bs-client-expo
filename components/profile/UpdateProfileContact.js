// components/profile/UpdateProfileContact.js
// Équivalent mobile de UpdateProfileContact.jsx.

import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AuthContext from "../../context/AuthContext";
import { useSession } from "../../lib/auth-client";
import { showToast } from "../../lib/toast";
import CountryPicker from "./CountryPicker";

const UpdateProfileContact = () => {
  const { data: session, refetch } = useSession();
  const user = session?.user;

  const { error, loading, updateProfile, clearErrors } =
    useContext(AuthContext);
  const router = useRouter();

  const [formState, setFormState] = useState({
    phone: "",
    address: { street: "", city: "", country: "" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;
      setFormState({
        phone: user?.phone || "",
        address: {
          street: user?.address?.street || "",
          city: user?.address?.city || "",
          country: user?.address?.country || "",
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      showToast(error);
      clearErrors();
      setIsSubmitting(false);
    }
  }, [error, clearErrors]);

  const setAddressField = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const submitHandler = async () => {
    try {
      setIsSubmitting(true);

      const { phone, address } = formState;
      await updateProfile({ phone, address });
      await refetch();

      showToast("Informations de contact mises à jour!");
      setTimeout(() => router.back(), 500);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      showToast(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="rounded-lg bg-white p-4 shadow-sm">
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center self-start rounded-md border border-gray-300 bg-white px-3 py-2 active:bg-gray-50"
      >
        <Ionicons name="arrow-back" size={16} color="#374151" />
        <Text className="ml-2 text-sm font-medium text-gray-700">Retour</Text>
      </Pressable>

      <Text className="mb-5 text-2xl font-semibold">
        Informations de contact
      </Text>

      {/* Téléphone */}
      <View className="mb-4">
        <Text className="mb-1 font-medium text-gray-700">
          Numéro de téléphone <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
          placeholder="Votre numéro de téléphone"
          placeholderTextColor="#9ca3af"
          value={formState.phone}
          onChangeText={(phone) => setFormState((prev) => ({ ...prev, phone }))}
          keyboardType="phone-pad"
          maxLength={15}
          editable={!isSubmitting}
          accessibilityLabel="Numéro de téléphone"
        />
      </View>

      {/* Adresse */}
      <View className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4">
        <Text className="mb-3 text-lg font-semibold text-gray-800">
          Adresse
        </Text>

        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Rue / Voie</Text>
          <TextInput
            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
            placeholder="Saisissez votre adresse"
            placeholderTextColor="#9ca3af"
            value={formState.address.street}
            onChangeText={(v) => setAddressField("street", v)}
            maxLength={100}
            editable={!isSubmitting}
            accessibilityLabel="Rue"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-1 font-medium text-gray-700">Ville</Text>
          <TextInput
            className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
            placeholder="Saisissez votre ville"
            placeholderTextColor="#9ca3af"
            value={formState.address.city}
            onChangeText={(v) => setAddressField("city", v)}
            maxLength={50}
            editable={!isSubmitting}
            accessibilityLabel="Ville"
          />
        </View>

        <View>
          <Text className="mb-1 font-medium text-gray-700">Pays</Text>
          <CountryPicker
            value={formState.address.country}
            onChange={(v) => setAddressField("country", v)}
            disabled={isSubmitting}
          />
        </View>
      </View>

      <Pressable
        onPress={submitHandler}
        disabled={isSubmitting || loading}
        className={`flex-row items-center justify-center rounded-md px-4 py-2 ${
          isSubmitting || loading
            ? "bg-blue-400"
            : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        {isSubmitting || loading ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="ml-2 text-white">Mise à jour en cours...</Text>
          </>
        ) : (
          <Text className="text-white">Mettre à jour</Text>
        )}
      </Pressable>
    </View>
  );
};

export default UpdateProfileContact;
