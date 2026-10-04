// components/profile/Profile.js
// Équivalent mobile de Profile.jsx.
// Le menu "⋮" (clic extérieur / Échap pour fermer) est remplacé par un
// overlay transparent plein écran qui ferme le menu au toucher, l'équivalent
// mobile naturel du "click outside".

import { memo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "../../lib/auth-client";

const Profile = () => {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [imageFailed, setImageFailed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const closeModal = () => setIsModalOpen(false);

  const goTo = (href) => {
    closeModal();
    router.push(href);
  };

  // Squelette de chargement
  if (isPending || !user) {
    return (
      <View className="gap-6">
        <View className="rounded-lg bg-white p-6 shadow-sm">
          <View className="flex-row items-center gap-4">
            <View className="h-24 w-24 rounded-full bg-gray-200" />
            <View className="flex-1 gap-3">
              <View className="h-4 w-3/4 rounded bg-gray-200" />
              <View className="h-4 w-1/2 rounded bg-gray-200" />
            </View>
          </View>
        </View>
        <View className="h-48 rounded-lg bg-white" />
      </View>
    );
  }

  const userData = {
    name: user?.name || "Utilisateur",
    email: user?.email || "Aucun email",
    phone: user?.phone || "Aucun téléphone",
    avatarUrl: !imageFailed ? user?.image : null,
    address: user?.address || null,
  };

  const hasAddress =
    userData.address?.street &&
    userData.address?.city &&
    userData.address?.country;

  const initial = userData.name.trim().charAt(0).toUpperCase();

  return (
    <ScrollView
      className="relative"
      contentContainerStyle={{ gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Card principale */}
      <View className="overflow-hidden rounded-lg bg-white shadow-sm">
        {/* Bandeau avec nom + menu */}
        <View className="h-24 flex-row items-end justify-between bg-blue-600 px-4 pb-2">
          <View className="w-20" />
          <View className="min-w-0 flex-1 pl-3">
            <Text className="text-xl font-bold text-white" numberOfLines={1}>
              {userData.name}
            </Text>
          </View>
          <Pressable
            onPress={toggleModal}
            accessibilityLabel="Plus d'options"
            accessibilityState={{ expanded: isModalOpen }}
            className="rounded-full p-2 active:bg-blue-700"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
          </Pressable>
        </View>

        <View className="px-4 pb-6">
          {/* Photo de profil */}
          <View className="-mt-10">
            <View className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-100">
              {userData.avatarUrl ? (
                <Image
                  source={{ uri: userData.avatarUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
                  accessibilityLabel={`Photo de profil de ${userData.name}`}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-blue-100">
                  <Text className="text-2xl font-semibold text-blue-700">
                    {initial}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact */}
          <View className="mt-6 gap-4">
            <View className="flex-row items-start rounded-lg p-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Ionicons name="mail-outline" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Adresse email
                </Text>
                <Text className="mt-1 text-sm text-gray-900">
                  {userData.email}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start rounded-lg p-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="call-outline" size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Numéro de téléphone
                </Text>
                <Text className="mt-1 text-sm text-gray-900">
                  {userData.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Card adresse */}
      <View className="overflow-hidden rounded-lg bg-white shadow-sm">
        <View className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={18} color="#2563eb" />
            <Text className="ml-2 text-lg font-semibold text-gray-900">
              Adresse
            </Text>
          </View>
        </View>

        <View className="px-4 py-6">
          {hasAddress ? (
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-900">
                {userData.address.street}
              </Text>
              <Text className="text-sm text-gray-600">
                {userData.address.city}
              </Text>
              <Text className="text-sm text-gray-600">
                {userData.address.country}
              </Text>

              <View className="mt-4 flex-row items-center self-start rounded-full bg-green-100 px-3 py-1">
                <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                <Text className="ml-1.5 text-xs font-medium text-green-800">
                  Adresse complète
                </Text>
              </View>
            </View>
          ) : (
            <View className="items-center py-8">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="location-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="mb-2 text-sm font-medium text-gray-900">
                Aucune adresse enregistrée
              </Text>
              <Text className="mb-4 text-center text-sm text-gray-500">
                Ajoutez votre adresse pour faciliter vos commandes
              </Text>
              <Pressable
                onPress={() => goTo("/me/update")}
                className="flex-row items-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
              >
                <Ionicons name="location-outline" size={16} color="#ffffff" />
                <Text className="ml-2 text-sm font-medium text-white">
                  Ajouter mon adresse
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Menu d'actions (overlay) */}
      {isModalOpen && (
        <Pressable onPress={closeModal} className="absolute inset-0 z-10">
          <View className="absolute right-0 top-20 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
            <Pressable
              onPress={() => goTo("/me/update")}
              className="flex-row items-center px-4 py-3 active:bg-orange-50"
            >
              <Ionicons name="pencil-outline" size={18} color="#ea580c" />
              <Text className="ml-3 text-sm text-gray-700">
                Modifier le profil
              </Text>
            </Pressable>

            <Pressable
              onPress={() => goTo("/me/update_password")}
              className="flex-row items-center px-4 py-3 active:bg-blue-50"
            >
              <Ionicons name="lock-closed-outline" size={18} color="#2563eb" />
              <Text className="ml-3 text-sm text-gray-700">
                Changer le mot de passe
              </Text>
            </Pressable>
          </View>
        </Pressable>
      )}
    </ScrollView>
  );
};

export default memo(Profile);
