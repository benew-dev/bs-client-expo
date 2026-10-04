// app/payment.js
// Équivalent mobile de app/payment/page.jsx.
// La vérification de session se fait côté client (pas de Server Component
// sur Expo), sur le même principe que app/cart.js.

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { fetchJson, getErrorMessage } from "../lib/api";
import { useSession } from "../lib/auth-client";
import Payment from "../components/payment/Payment";
import PaymentPageSkeleton from "../components/skeletons/PaymentPageSkeleton";
import { showToast } from "../lib/toast";

export default function PaymentScreen() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  // Rediriger vers login si pas de session
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace({
        pathname: "/login",
        params: { callbackUrl: "/payment" },
      });
    }
  }, [isPending, session?.user, router]);

  // Récupérer les plateformes de paiement
  useEffect(() => {
    if (isPending || !session?.user) return;

    let cancelled = false;

    const load = async () => {
      setLoadingPlatforms(true);
      try {
        const json = await fetchJson("/api/v1/paymentPlatform");
        if (!cancelled) setPaymentTypes(json?.data?.platforms || []);
      } catch (err) {
        if (!cancelled) {
          console.error("Payment platforms fetch error:", err.message);
          showToast(
            getErrorMessage(
              err,
              "Erreur lors de la récupération des plateformes de paiement",
            ),
          );
        }
      } finally {
        if (!cancelled) setLoadingPlatforms(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user]);

  if (isPending || loadingPlatforms) {
    return <PaymentPageSkeleton />;
  }

  if (!session?.user) {
    // Redirection en cours (useEffect ci-dessus)
    return null;
  }

  return <Payment paymentTypes={paymentTypes} />;
}
