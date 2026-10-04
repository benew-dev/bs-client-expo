// components/order/ReviewOrder.js
// Équivalent mobile de ReviewOrder.jsx.

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CartContext from "../../context/CartContext";
import OrderContext from "../../context/OrderContext";
import { formatPrice } from "../../helpers/helpers";
import { showToast } from "../../lib/toast";
import { captureClientError } from "../../lib/monitoring";
import BreadCrumbs from "../layouts/BreadCrumbs";
import ReviewOrderSkeleton from "./ReviewOrderSkeleton";

const ReviewOrder = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { cart, cartTotal, cartCount } = useContext(CartContext);
  const { orderInfo, addOrder, error, clearErrors } = useContext(OrderContext);

  const isCashPayment = useMemo(
    () =>
      orderInfo?.paymentInfo?.typePayment === "CASH" ||
      orderInfo?.paymentInfo?.isCashPayment === true,
    [orderInfo],
  );

  // Vérification que les données de paiement sont présentes
  useEffect(() => {
    const checkOrderData = async () => {
      try {
        setIsLoading(true);

        if (!orderInfo || !orderInfo.paymentInfo) {
          showToast("Veuillez d'abord renseigner vos informations de paiement");
          router.replace("/payment");
          return;
        }

        if (!cart || cart.length === 0) {
          showToast("Votre panier est vide");
          router.replace("/cart");
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des données:", error);
        captureClientError(error, "ReviewOrder", "checkOrderData", true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOrderData();
  }, [orderInfo, cart, router]);

  useEffect(() => {
    if (error) {
      showToast(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  const totalAmount = useMemo(
    () => cartTotal?.toFixed(2) || "0.00",
    [cartTotal],
  );

  const breadCrumbs = useMemo(
    () => [
      { name: "Accueil", url: "/" },
      { name: "Panier", url: "/cart" },
      { name: "Paiement", url: "/payment" },
      { name: "Révision", url: "/review-order" },
    ],
    [],
  );

  const handleConfirmOrder = useCallback(async () => {
    try {
      setIsSubmitting(true);

      if (!orderInfo || !orderInfo.paymentInfo) {
        showToast("Informations de commande incomplètes");
        router.replace("/payment");
        return;
      }

      // La redirection vers /confirmation est gérée par OrderContext
      await addOrder(orderInfo);
    } catch (error) {
      console.error("Erreur lors de la confirmation de la commande:", error);
      captureClientError(error, "ReviewOrder", "handleConfirmOrder", true);
      showToast("Une erreur est survenue lors de la confirmation");
    } finally {
      setIsSubmitting(false);
    }
  }, [orderInfo, addOrder, router]);

  if (isLoading) {
    return <ReviewOrderSkeleton />;
  }

  if (!orderInfo || !orderInfo.paymentInfo) {
    return null;
  }

  const { typePayment, paymentAccountName, paymentAccountNumber } =
    orderInfo.paymentInfo;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <BreadCrumbs breadCrumbs={breadCrumbs} />

      {/* En-tête */}
      <View className="bg-blue-50 px-4 py-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-800">
            Révision de votre commande
          </Text>
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-sm font-medium text-blue-800">
              Étape finale
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4">
        {/* Articles */}
        <View className="mb-4 rounded-lg bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="cube-outline" size={20} color="#2563eb" />
              <Text className="ml-2 text-lg font-semibold text-gray-800">
                Articles ({cartCount})
              </Text>
            </View>
            <Pressable onPress={() => router.push("/cart")}>
              <Text className="text-sm font-medium text-blue-600">
                Modifier
              </Text>
            </Pressable>
          </View>

          <View className="gap-4">
            {cart?.map((item) => (
              <View
                key={item.id}
                className="flex-row items-start gap-4 border-b border-gray-100 pb-4 last:border-b-0"
              >
                <View className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center">
                      <Text className="text-xs text-gray-400">
                        Aucune image
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="font-medium text-gray-800">
                    {item.productName}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Quantité : {item.quantity}
                  </Text>
                  <Text className="mt-1 text-sm font-medium text-gray-700">
                    {formatPrice(item.price)} × {item.quantity}
                  </Text>
                </View>

                <Text className="font-semibold text-gray-800">
                  {formatPrice(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Informations de paiement */}
        <View className="mb-4 rounded-lg bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons
                name={isCashPayment ? "cash-outline" : "card-outline"}
                size={20}
                color={isCashPayment ? "#16a34a" : "#2563eb"}
              />
              <Text className="ml-2 text-lg font-semibold text-gray-800">
                Informations de paiement
              </Text>
            </View>
            <Pressable onPress={() => router.push("/payment")}>
              <Text className="text-sm font-medium text-blue-600">
                Modifier
              </Text>
            </Pressable>
          </View>

          {isCashPayment ? (
            <View className="rounded-lg border border-green-200 bg-green-50 p-4">
              <View className="flex-row">
                <Ionicons name="cash-outline" size={24} color="#16a34a" />
                <View className="ml-3 flex-1">
                  <Text className="mb-2 font-semibold text-green-800">
                    Paiement en espèces
                  </Text>
                  <Text className="mb-2 text-sm text-green-700">
                    Vous paierez en espèces lors de la récupération de votre
                    commande.
                  </Text>
                  <View className="mt-3 border-t border-green-300 pt-3">
                    <View className="mb-1 flex-row justify-between">
                      <Text className="text-sm text-green-700">
                        Montant à préparer :
                      </Text>
                      <Text className="font-bold text-green-800">
                        {formatPrice(totalAmount)}
                      </Text>
                    </View>
                    <Text className="mt-2 text-xs text-green-600">
                      💡 Conseil : Préparez la somme exacte pour faciliter la
                      transaction
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-3">
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Plateforme :</Text>
                <View className="rounded-full bg-blue-100 px-3 py-1">
                  <Text className="text-sm font-medium text-gray-800">
                    {typePayment}
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Nom du compte :</Text>
                <Text className="font-medium text-gray-800">
                  {paymentAccountName}
                </Text>
              </View>
              <View className="flex-row justify-between py-2">
                <Text className="text-gray-600">Numéro de compte :</Text>
                <Text className="font-medium text-gray-800">
                  {paymentAccountNumber}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Message d'information */}
        <View
          className={`mb-4 flex-row rounded-lg border p-4 ${
            isCashPayment
              ? "border-green-200 bg-green-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={isCashPayment ? "#15803d" : "#1d4ed8"}
          />
          <Text
            className={`ml-2 flex-1 text-sm ${
              isCashPayment ? "text-green-700" : "text-blue-700"
            }`}
          >
            {isCashPayment
              ? "En confirmant votre commande, vous vous engagez à payer en espèces lors de la récupération. Votre commande sera préparée et vous serez contacté une fois prête."
              : 'En appuyant sur "Confirmer et payer", vous acceptez nos conditions générales de vente et confirmez que toutes les informations fournies sont correctes.'}
          </Text>
        </View>

        {/* Résumé et actions */}
        <View className="rounded-lg bg-white p-6">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Résumé de commande
          </Text>

          <View className="mb-6 gap-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">
                Sous-total ({cartCount} articles) :
              </Text>
              <Text className="text-gray-600">{formatPrice(totalAmount)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Frais de livraison :</Text>
              <Text className="text-green-600">Gratuit</Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-200 pt-3">
              <Text className="text-lg font-bold text-gray-800">
                {isCashPayment ? "Total à préparer :" : "Total à payer :"}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isCashPayment ? "text-green-600" : "text-blue-600"
                }`}
              >
                {formatPrice(totalAmount)}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={handleConfirmOrder}
              disabled={isSubmitting}
              className={`flex-row items-center justify-center rounded-md px-5 py-3 ${
                isSubmitting
                  ? "bg-gray-400"
                  : isCashPayment
                    ? "bg-green-600 active:bg-green-700"
                    : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="ml-2 font-medium text-white">
                    Traitement en cours...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text className="ml-2 font-medium text-white">
                    {isCashPayment
                      ? "Confirmer la commande"
                      : "Confirmer et payer"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/payment")}
              className="flex-row items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-3 active:bg-gray-50"
            >
              <Ionicons name="chevron-back" size={20} color="#374151" />
              <Text className="ml-2 font-medium text-gray-700">
                Retour au paiement
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 flex-row items-center justify-center gap-2 border-t border-gray-200 pt-6">
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#6b7280"
            />
            <Text className="text-xs text-gray-500">
              {isCashPayment ? "Commande sécurisée" : "Paiement sécurisé"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReviewOrder;
