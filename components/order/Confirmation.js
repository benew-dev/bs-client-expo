// components/order/Confirmation.js
// Équivalent mobile de Confirmation.jsx.

import { useContext, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CartContext from "../../context/CartContext";
import OrderContext from "../../context/OrderContext";
import { showToast } from "../../lib/toast";
import BreadCrumbs from "../layouts/BreadCrumbs";

// Configuration des plateformes de paiement
// (mêmes classes Tailwind que le web — NativeWind les reconnaît directement)
const PLATFORM_CONFIG = {
  WAAFI: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: "phone-portrait-outline",
    displayName: "Waafi",
  },
  "D-MONEY": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: "phone-portrait-outline",
    displayName: "D-Money",
  },
  "CAC-PAY": {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    icon: "business-outline",
    displayName: "CAC Pay",
  },
  "BCI-PAY": {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: "business-outline",
    displayName: "BCI Pay",
  },
  CASH: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: "cash-outline",
    displayName: "Espèces",
  },
};

const DEFAULT_CONFIG = {
  bg: "bg-gray-100",
  text: "text-gray-700",
  border: "border-gray-200",
  icon: "card-outline",
};

const Confirmation = () => {
  const router = useRouter();
  const { orderId, paymentTypes } = useContext(OrderContext);
  const { setCartToState } = useContext(CartContext);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await setCartToState();
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
        showToast("Impossible de charger votre panier. Veuillez réessayer.");
      }
    };

    loadCart();
  }, [setCartToState]);

  const breadCrumbs = [
    { name: "Accueil", url: "/" },
    { name: "Confirmation", url: "/confirmation" },
  ];

  // Pas d'équivalent direct à notFound() côté Expo : état de repli explicite
  // plutôt qu'un crash (orderId vit en mémoire et disparaît après un reload).
  if (orderId === undefined || orderId === null) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="receipt-outline" size={56} color="#9ca3af" />
        <Text className="mb-2 mt-4 text-xl font-semibold text-gray-800">
          Aucune commande à afficher
        </Text>
        <Text className="mb-6 text-center text-gray-600">
          Cette page n&apos;est accessible qu&apos;après la confirmation
          d&apos;une commande.
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          className="rounded-md bg-blue-600 px-6 py-3 active:bg-blue-700"
        >
          <Text className="font-semibold text-white">
            Retour à l&apos;accueil
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <BreadCrumbs breadCrumbs={breadCrumbs} />

      <View className="p-4">
        <View className="rounded-lg bg-white p-6">
          {/* Icône de succès */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
            </View>

            <Text className="mb-2 text-2xl font-bold text-gray-900">
              Commande confirmée !
            </Text>

            <Text className="text-gray-600">
              Numéro de commande :{" "}
              <Text className="font-mono font-semibold">{orderId}</Text>
            </Text>
          </View>

          {/* Moyens de paiement */}
          <View className="border-t border-gray-200 pt-6">
            <View className="mb-6 flex-row items-center">
              <View className="rounded-lg bg-blue-100 p-2">
                <Ionicons name="card-outline" size={22} color="#2563eb" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold text-gray-900">
                  Moyens de paiement disponibles
                </Text>
                <Text className="text-sm text-gray-600">
                  Utilisez l&apos;un de ces moyens pour effectuer votre paiement
                </Text>
              </View>
            </View>

            {paymentTypes && paymentTypes.length > 0 ? (
              <View className="gap-4">
                {paymentTypes.map((payment, index) => {
                  const config = PLATFORM_CONFIG[payment?.platform] || {
                    ...DEFAULT_CONFIG,
                    displayName: payment?.platform || "Inconnu",
                  };
                  const isCash =
                    payment?.platform === "CASH" || payment?.isCashPayment;

                  return (
                    <View
                      key={payment._id || index}
                      className="rounded-xl border-2 border-gray-200 p-4"
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`mr-4 rounded-xl border-2 p-3 ${config.bg} ${config.border}`}
                        >
                          <Ionicons
                            name={config.icon}
                            size={26}
                            className={config.text}
                          />
                        </View>

                        <View className="flex-1">
                          <View className="mb-2 flex-row flex-wrap items-center gap-2">
                            <Text className="text-lg font-bold text-gray-900">
                              {config.displayName}
                            </Text>
                            <View
                              className={`rounded-full border px-3 py-1 ${config.bg} ${config.border}`}
                            >
                              <Text
                                className={`text-xs font-semibold ${config.text}`}
                              >
                                Disponible
                              </Text>
                            </View>
                          </View>

                          {isCash ? (
                            <View className="self-start rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                              <Text className="text-sm font-medium text-emerald-700">
                                Paiement à la livraison
                              </Text>
                            </View>
                          ) : (
                            <View className="gap-1">
                              <View className="flex-row">
                                <Text className="text-xs uppercase text-gray-500">
                                  Titulaire :{" "}
                                </Text>
                                <Text className="font-semibold text-gray-900">
                                  {payment?.paymentName ||
                                    payment?.name ||
                                    "Non renseigné"}
                                </Text>
                              </View>
                              <View className="flex-row">
                                <Text className="text-xs uppercase text-gray-500">
                                  N° :{" "}
                                </Text>
                                <Text className="font-mono font-bold text-gray-900">
                                  {payment?.paymentNumber ||
                                    payment?.number ||
                                    "Non renseigné"}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
                <View className="flex-row">
                  <Ionicons name="card-outline" size={20} color="#ca8a04" />
                  <View className="ml-3 flex-1">
                    <Text className="mb-1 font-semibold text-yellow-900">
                      Aucune information de paiement disponible
                    </Text>
                    <Text className="text-sm text-yellow-700">
                      Veuillez contacter le support pour plus
                      d&apos;informations.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Informations générales */}
            <View className="mt-6 gap-4">
              <View className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <View className="flex-row">
                  <Ionicons name="cube-outline" size={20} color="#2563eb" />
                  <View className="ml-3 flex-1">
                    <Text className="mb-1 font-medium text-blue-800">
                      Prochaines étapes
                    </Text>
                    <Text className="text-sm text-blue-700">
                      • Nous préparons votre commande{"\n"}• Effectuez le
                      paiement via l&apos;un des moyens ci-dessus{"\n"}• Vous
                      serez contacté une fois la commande prête{"\n"}• Récupérez
                      votre commande au point de retrait
                    </Text>
                  </View>
                </View>
              </View>

              <View className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <View className="flex-row">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#d97706"
                  />
                  <Text className="ml-3 flex-1 text-sm text-amber-800">
                    <Text className="font-medium">Important : </Text>
                    Effectuez le paiement vers l&apos;un des comptes indiqués
                    ci-dessus. Votre commande sera traitée une fois le paiement
                    confirmé.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mt-8 gap-3">
            <Pressable
              onPress={() => router.push("/me/orders")}
              className="items-center rounded-md bg-blue-600 px-6 py-3 active:bg-blue-700"
            >
              <Text className="font-medium text-white">Voir mes commandes</Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace("/")}
              className="items-center rounded-md border border-gray-300 px-6 py-3 active:bg-gray-50"
            >
              <Text className="font-medium text-gray-700">
                Continuer mes achats
              </Text>
            </Pressable>
          </View>

          {/* Contact */}
          <View className="mt-6 border-t border-gray-200 pt-6">
            <Text className="text-center text-sm text-gray-600">
              Des questions ?{" "}
              <Text
                className="text-blue-600"
                onPress={() => router.push("/contact")}
              >
                Page de contact
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Confirmation;
