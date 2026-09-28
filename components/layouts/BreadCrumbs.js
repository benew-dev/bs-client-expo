// components/layouts/BreadCrumbs.js
// Équivalent mobile de BreadCrumbs.jsx.

import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BreadCrumbs = memo(({ breadCrumbs }) => {
  const router = useRouter();

  if (!Array.isArray(breadCrumbs) || breadCrumbs.length === 0) {
    return null;
  }

  return (
    <View className="bg-blue-100 px-4 py-5">
      <View className="flex-row flex-wrap items-center">
        {breadCrumbs.map((breadCrumb, index) => (
          <View key={index} className="flex-row items-center">
            <Pressable onPress={() => router.push(breadCrumb.url)}>
              <Text className="text-gray-600">{breadCrumb.name}</Text>
            </Pressable>
            {breadCrumbs.length - 1 !== index && (
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#9ca3af"
                style={{ marginHorizontal: 6 }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
});

BreadCrumbs.displayName = "BreadCrumbs";

export default BreadCrumbs;
