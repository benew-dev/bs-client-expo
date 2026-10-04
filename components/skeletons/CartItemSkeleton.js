// components/skeletons/CartItemSkeleton.js
// Équivalent mobile de CartItemSkeleton.jsx.

import { View } from "react-native";
import Pulse from "./Pulse";

const CartItemSkeleton = () => {
  return (
    <View className="border-b border-gray-100 py-4">
      <View className="flex-row items-start">
        <Pulse className="mr-4 h-16 w-16" />

        <View className="flex-1 gap-2">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-3 w-20" />
          <Pulse className="mt-2 h-9 w-24" />
        </View>

        <View className="items-end gap-2">
          <Pulse className="h-4 w-16" />
          <Pulse className="h-3 w-20" />
        </View>
      </View>
    </View>
  );
};

export default CartItemSkeleton;
