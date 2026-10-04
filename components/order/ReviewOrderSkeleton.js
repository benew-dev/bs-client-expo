// components/order/ReviewOrderSkeleton.js
// Équivalent mobile de ReviewOrderSkeleton.jsx.

import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pulse from "../skeletons/Pulse";

const ReviewOrderSkeleton = () => (
  <SafeAreaView
    edges={["bottom", "left", "right"]}
    className="flex-1 bg-gray-50"
  >
    {/* En-tête */}
    <View className="bg-blue-50 px-4 py-5">
      <View className="flex-row items-center justify-between">
        <Pulse className="h-7 w-48" />
        <Pulse className="h-7 w-24 rounded-full" />
      </View>
    </View>

    <View className="p-4">
      {/* Articles */}
      <View className="mb-4 rounded-lg bg-white p-6">
        <Pulse className="mb-4 h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <View key={i} className="mb-4 flex-row gap-4">
            <Pulse className="h-20 w-20" />
            <View className="flex-1 gap-2">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-3 w-1/2" />
              <Pulse className="h-3 w-1/3" />
            </View>
          </View>
        ))}
      </View>

      {/* Infos paiement */}
      <View className="mb-4 rounded-lg bg-white p-6">
        <Pulse className="mb-4 h-6 w-48" />
        {[1, 2, 3].map((i) => (
          <View key={i} className="mb-3 flex-row justify-between">
            <Pulse className="h-4 w-32" />
            <Pulse className="h-4 w-24" />
          </View>
        ))}
      </View>

      {/* Résumé / actions */}
      <View className="rounded-lg bg-white p-6">
        <Pulse className="mb-4 h-6 w-40" />
        <View className="mb-6 gap-3">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
        </View>
        <View className="gap-3">
          <Pulse className="h-12 w-full" />
          <Pulse className="h-12 w-full" />
        </View>
      </View>
    </View>
  </SafeAreaView>
);

export default ReviewOrderSkeleton;
