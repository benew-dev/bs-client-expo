// components/payment/NoPaymentMethodsFound.js
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const NoPaymentMethodsFound = memo(() => {
  const router = useRouter();

  return (
    <View className="items-center rounded-lg border border-gray-200 bg-gray-50 py-8">
      <Ionicons name="cash-outline" size={48} color="#6b7280" />
      <Text className="mb-2 mt-4 text-lg font-semibold text-gray-800">
        Aucun moyen de paiement disponible
      </Text>
      <Text className="mb-4 px-4 text-center text-gray-600">
        Nos moyens de paiement sont temporairement indisponibles. Veuillez
        réessayer plus tard.
      </Text>
      <Pressable
        onPress={() => router.push("/cart")}
        className="flex-row items-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
      >
        <Text className="text-white">Retour au panier</Text>
      </Pressable>
    </View>
  );
});

NoPaymentMethodsFound.displayName = "NoPaymentMethodsFound";

export default NoPaymentMethodsFound;
