// components/payment/PaymentMethodCard.js
// Équivalent mobile de PaymentMethodCard (RN n'a pas de gradient CSS natif :
// une couleur pleine remplace chaque dégradé du web).

import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PLATFORM_COLORS = {
  WAAFI: "#2563eb",
  "D-MONEY": "#9333ea",
  "CAC-PAY": "#16a34a",
  "BCI-PAY": "#ea580c",
  CASH: "#1f2937",
};

const PaymentMethodCard = memo(({ payment, isSelected, onSelect }) => {
  const color = PLATFORM_COLORS[payment?.platform] || "#059669";
  const isCash = payment?.platform === "CASH" || payment?.isCashPayment;

  return (
    <Pressable
      onPress={() => onSelect(payment)}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      className={`rounded-lg border p-4 ${
        isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <View className="mb-3 flex-row items-center">
        <View
          className={`mr-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
            isSelected ? "border-blue-600" : "border-gray-300"
          }`}
        >
          {isSelected && (
            <View className="h-2.5 w-2.5 rounded-full bg-blue-600" />
          )}
        </View>

        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: color }}
        >
          {isCash && (
            <Ionicons
              name="cash-outline"
              size={14}
              color="#ffffff"
              style={{ marginRight: 4 }}
            />
          )}
          <Text className="text-sm font-bold text-white">
            {payment?.platform}
          </Text>
        </View>
      </View>

      <View className="ml-8">
        {isCash ? (
          <Text className="text-sm font-medium text-gray-600">
            Paiement en espèces lors de la récupération
          </Text>
        ) : (
          <>
            <Text className="text-sm text-gray-600">
              <Text className="font-medium">Titulaire : </Text>
              {payment?.name}
            </Text>
            <Text className="text-sm text-gray-600">
              <Text className="font-medium">Numéro : </Text>
              {payment?.number}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
});

PaymentMethodCard.displayName = "PaymentMethodCard";

export default PaymentMethodCard;
