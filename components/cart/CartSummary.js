// components/cart/CartSummary.js
// Équivalent mobile de CartSummary.jsx.

import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { formatPrice } from "../../lib/format";

const CartSummary = memo(({ cartItems, amount }) => {
  const router = useRouter();
  const totalUnits = cartItems.reduce(
    (acc, item) => acc + (item?.quantity || 0),
    0,
  );

  return (
    <View className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <Text className="mb-4 border-b border-gray-200 pb-4 text-lg font-semibold">
        Récapitulatif
      </Text>

      <View className="mb-5 space-y-3">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Nombre d&apos;articles :</Text>
          <Text className="font-medium text-gray-800">{totalUnits}</Text>
        </View>

        <View className="flex-row justify-between border-t border-gray-200 pt-4">
          <Text className="text-lg font-bold text-gray-800">Total :</Text>
          <Text className="text-lg font-bold text-blue-600">
            {formatPrice(amount)}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          onPress={() => router.replace("/payment")}
          className="items-center rounded-lg bg-blue-600 px-4 py-3 active:bg-blue-700"
        >
          <Text className="text-sm font-medium text-white">
            Continuer vers le paiement
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          className="items-center rounded-lg border border-gray-200 bg-white px-4 py-3 active:bg-gray-50"
        >
          <Text className="text-sm font-medium text-blue-600">
            Continuer mes achats
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

CartSummary.displayName = "CartSummary";

export default CartSummary;
