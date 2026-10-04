// components/skeletons/CartSkeleton.js
// Équivalent mobile de CartSkeleton.jsx (squelette complet : premier chargement).

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pulse from "./Pulse";
import CartItemSkeleton from "./CartItemSkeleton";

const CartHeaderSkeleton = () => (
  <View className="border-b border-gray-200 bg-blue-50 px-4 py-4">
    <View className="flex-row items-center justify-between">
      <Pulse className="h-7 w-32" />
      <Pulse className="h-6 w-20 rounded-full" />
    </View>
  </View>
);

const CartSummarySkeleton = () => (
  <View className="rounded-lg border border-gray-200 bg-white p-4">
    <Pulse className="mb-4 h-5 w-32" />

    <View className="mb-5 gap-3">
      <View className="flex-row justify-between">
        <Pulse className="h-4 w-28" />
        <Pulse className="h-4 w-10" />
      </View>
      <View className="flex-row justify-between border-t border-gray-200 pt-4">
        <Pulse className="h-5 w-14" />
        <Pulse className="h-5 w-20" />
      </View>
    </View>

    <View className="gap-3">
      <Pulse className="h-12 w-full" />
      <Pulse className="h-12 w-full" />
    </View>
  </View>
);

const CartSkeleton = () => {
  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      <CartHeaderSkeleton />

      <View className="p-4">
        <View className="mb-4 rounded-lg bg-white p-4">
          {[...Array(3)].map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </View>

        <CartSummarySkeleton />
      </View>
    </SafeAreaView>
  );
};

export default CartSkeleton;
