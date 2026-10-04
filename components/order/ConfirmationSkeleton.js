// components/order/ConfirmationSkeleton.js
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Pulse from "../skeletons/Pulse";

const ConfirmationSkeleton = () => (
  <SafeAreaView
    edges={["bottom", "left", "right"]}
    className="flex-1 bg-gray-50"
  >
    <View className="p-4">
      <View className="rounded-lg bg-white p-8">
        <Pulse className="mx-auto mb-4 h-7 w-3/4" />
        <Pulse className="mx-auto mb-8 h-4 w-1/2" />
        <View className="gap-4">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-3/4" />
        </View>
      </View>
    </View>
  </SafeAreaView>
);

export default ConfirmationSkeleton;
