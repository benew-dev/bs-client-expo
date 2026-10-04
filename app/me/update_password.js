// app/me/update_password.js
// Équivalent mobile de app/me/update_password/page.jsx.
// La session est déjà vérifiée par app/me/_layout.js.

import { View, Text } from "react-native";
import UpdatePassword from "../../components/profile/UpdatePassword";

export default function UpdatePasswordScreen() {
  return (
    <View className="flex-1">
      <View className="items-center px-4 pb-2 pt-4">
        <Text className="text-2xl font-extrabold text-gray-900">
          Modifier votre mot de passe
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          Choisissez un mot de passe fort pour sécuriser votre compte
        </Text>
      </View>

      <UpdatePassword />
    </View>
  );
}
