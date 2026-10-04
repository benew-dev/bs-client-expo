// app/me/_layout.js
// Équivalent mobile de app/me/layout.jsx : garde-fou de session partagé
// par /me, /me/orders et /me/contact, avec l'en-tête "ESPACE PERSONNEL".

import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname, useRouter } from "expo-router";
import { useSession } from "../../lib/auth-client";

export default function UserLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace({
        pathname: "/login",
        params: { callbackUrl: pathname || "/me" },
      });
    }
  }, [isPending, session?.user, router, pathname]);

  if (isPending) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="flex-1 items-center justify-center bg-gray-50"
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (!session?.user) {
    // Redirection en cours (useEffect ci-dessus)
    return null;
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      <View className="bg-blue-100 px-4 py-4">
        <Text className="text-xl font-medium text-slate-800">
          ESPACE PERSONNEL
        </Text>
      </View>

      <View className="flex-1 p-4">
        <View className="flex-1 rounded-md border border-gray-200 bg-white p-4">
          <Slot />
        </View>
      </View>
    </SafeAreaView>
  );
}
