// app/_layout.js
// Layout global : le Header (avec la barre de recherche) apparaît sur tous les écrans.

import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "../context/CartContext";
import Header from "../components/layouts/Header";

export default function RootLayout() {
  console.log("getSetCookie support:", typeof new Headers().getSetCookie);

  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <View className="flex-1 bg-gray-50">
          <Header />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#f9fafb" },
            }}
          />
        </View>
      </CartProvider>
    </SafeAreaProvider>
  );
}
