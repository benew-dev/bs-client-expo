// app/me/update.js
// Équivalent mobile de app/me/update/page.jsx.
// Grille 2 colonnes (web) -> empilement vertical (mobile), dans un
// ScrollView, puisque app/me/_layout.js ne fournit pas de défilement.

import { ScrollView, Text, View } from "react-native";
import UpdateProfileBasic from "../../components/profile/UpdateProfileBasic";
import UpdateProfileContact from "../../components/profile/UpdateProfileContact";

export default function UpdateProfileScreen() {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="mb-6 items-center">
        <Text className="text-2xl font-extrabold text-gray-900">
          Modifier votre profil
        </Text>
        <Text className="mt-2 text-sm text-gray-600">
          Mettez à jour vos informations personnelles
        </Text>
      </View>

      <View className="gap-6">
        <UpdateProfileBasic />
        <UpdateProfileContact />
      </View>

      <View className="mt-8 flex-row rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Text className="mr-2 text-blue-400">ℹ️</Text>
        <View className="flex-1">
          <Text className="mb-1 text-sm font-medium text-blue-800">
            Information
          </Text>
          <Text className="text-sm text-blue-700">
            Vous pouvez mettre à jour votre profil et vos informations de
            contact séparément. Chaque section se sauvegarde indépendamment.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
