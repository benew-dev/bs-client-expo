// app/cart.js
// Équivalent mobile de app/cart/page.jsx + components/cart/Cart.jsx.

import { useContext, useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import CartContext from "../context/CartContext";
import { useSession } from "../lib/auth-client";
import useCartOperations from "../hooks/useCartOperations";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";
import CartSkeleton from "../components/skeletons/CartSkeleton";
import CartItemSkeleton from "../components/skeletons/CartItemSkeleton";

export default function CartScreen() {
  const { loading, cart, cartCount, cartTotal, error, clearError } =
    useContext(CartContext);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const {
    deleteInProgress,
    itemBeingRemoved,
    increaseQty,
    decreaseQty,
    handleDeleteItem,
  } = useCartOperations();

  // Rediriger vers login si pas de session (même logique que le web :
  // couvre le cas d'un accès direct à /cart, que CartContext ne gère pas seul)
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace({ pathname: "/login", params: { callbackUrl: "/cart" } });
    }
  }, [isPending, session?.user, router]);

  // Nettoyage de l'erreur si elle existe
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

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

  // Premier chargement (panier encore vide) : squelette complet,
  // comme sur le web
  if (loading && cart.length === 0) {
    return <CartSkeleton />;
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
      <View className="border-b border-gray-200 bg-blue-50 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-800">
            Mon Panier
          </Text>
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-sm font-medium text-blue-800">
              {cartCount || 0} produit{cartCount !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      </View>

      {!loading && cart?.length === 0 ? (
        <EmptyCart />
      ) : loading ? (
        // Rechargement (ex: après +/-/suppression) : la liste repasse en
        // squelette, mais le résumé garde les vraies données, comme sur le web
        <View className="p-4">
          <View className="mb-4 rounded-lg bg-white p-4">
            {[...Array(3)].map((_, index) => (
              <CartItemSkeleton key={index} />
            ))}
          </View>
          <CartSummary cartItems={cart} amount={cartTotal} />
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartItem
              cartItem={item}
              deleteItemFromCart={handleDeleteItem}
              decreaseQty={decreaseQty}
              increaseQty={increaseQty}
              deleteInProgress={
                deleteInProgress && itemBeingRemoved === item.id
              }
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListFooterComponent={
            cart?.length > 0 ? (
              <View className="mt-4">
                <CartSummary cartItems={cart} amount={cartTotal} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
