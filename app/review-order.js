// app/review-order.js
// Équivalent mobile de app/review-order/page.jsx.
// Vérification de session côté client (même principe que app/cart.js et
// app/payment.js). ReviewOrder ne prend aucune prop serveur : il lit tout
// depuis CartContext/OrderContext.

import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useSession } from "../lib/auth-client";
import ReviewOrder from "../components/order/ReviewOrder";
import ReviewOrderSkeleton from "../components/order/ReviewOrderSkeleton";

export default function ReviewOrderScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace({
        pathname: "/login",
        params: { callbackUrl: "/review-order" },
      });
    }
  }, [isPending, session?.user, router]);

  if (isPending) {
    return <ReviewOrderSkeleton />;
  }

  if (!session?.user) {
    // Redirection en cours (useEffect ci-dessus)
    return null;
  }

  return <ReviewOrder />;
}
