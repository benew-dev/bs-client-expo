// app/confirmation.js
// Équivalent mobile de app/confirmation/page.jsx.

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../lib/auth-client";
import Confirmation from "../components/order/Confirmation";
import ConfirmationSkeleton from "../components/order/ConfirmationSkeleton";

export default function ConfirmationScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session?.user, router]);

  if (isPending) {
    return <ConfirmationSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      <ScrollView>
        <Confirmation />
      </ScrollView>
    </SafeAreaView>
  );
}
