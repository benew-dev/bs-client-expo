// components/cart/CartItem.js
// Équivalent mobile de ItemCart.jsx.

import { memo, useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "../../lib/format";

const CartItem = memo(
  ({
    cartItem,
    deleteItemFromCart,
    decreaseQty,
    increaseQty,
    deleteInProgress,
  }) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOutOfStock = cartItem?.stock === 0;
    const isStockLow = cartItem?.stock > 0 && cartItem?.stock <= 5;

    // Refermer la confirmation si l'article est retiré ailleurs (ex: stock épuisé)
    useEffect(() => {
      setShowDeleteConfirm(false);
    }, [cartItem?.id]);

    const handleDelete = async () => {
      if (deleteInProgress) return;

      setIsDeleting(true);
      await deleteItemFromCart(cartItem.id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    };

    return (
      <View className="border-b border-gray-100 py-4">
        <View className="flex-row items-start">
          <Pressable
            onPress={() => router.push(`/product/${cartItem?.productId}`)}
            className="mr-4 h-24 w-24 overflow-hidden rounded border border-gray-200"
          >
            {cartItem?.imageUrl && !imageFailed ? (
              <Image
                source={{ uri: cartItem.imageUrl }}
                className="h-full w-full"
                resizeMode="contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-100">
                <Text className="text-xs text-gray-400">Aucune image</Text>
              </View>
            )}
          </Pressable>

          <View className="flex-1">
            <Pressable
              onPress={() => router.push(`/product/${cartItem?.productId}`)}
            >
              <Text className="font-semibold text-gray-800" numberOfLines={2}>
                {cartItem?.productName}
              </Text>
            </Pressable>

            <View className="mt-1 flex-row">
              {isOutOfStock ? (
                <View className="rounded-full bg-red-100 px-2 py-0.5">
                  <Text className="text-xs font-medium text-red-800">
                    Rupture de stock
                  </Text>
                </View>
              ) : isStockLow ? (
                <View className="rounded-full bg-yellow-100 px-2 py-0.5">
                  <Text className="text-xs font-medium text-yellow-800">
                    Stock limité : {cartItem?.stock}
                  </Text>
                </View>
              ) : (
                <View className="rounded-full bg-green-100 px-2 py-0.5">
                  <Text className="text-xs font-medium text-green-800">
                    En stock
                  </Text>
                </View>
              )}
            </View>

            {/* Quantité */}
            <View className="mt-3 flex-row items-center self-start rounded-lg border border-gray-200 bg-gray-50">
              <Pressable
                onPress={() => decreaseQty(cartItem)}
                disabled={cartItem.quantity <= 1 || isOutOfStock}
                accessibilityLabel="Diminuer la quantité"
                className="h-9 w-9 items-center justify-center rounded-l-lg active:bg-gray-100 disabled:opacity-40"
              >
                <Ionicons name="remove" size={18} color="#374151" />
              </Pressable>

              <Text className="w-10 text-center font-medium text-gray-900">
                {cartItem?.quantity}
              </Text>

              <Pressable
                onPress={() => increaseQty(cartItem)}
                disabled={cartItem.quantity >= cartItem?.stock || isOutOfStock}
                accessibilityLabel="Augmenter la quantité"
                className="h-9 w-9 items-center justify-center rounded-r-lg active:bg-gray-100 disabled:opacity-40"
              >
                <Ionicons name="add" size={18} color="#374151" />
              </Pressable>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-base font-medium text-blue-600">
              {formatPrice(cartItem?.subtotal)}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatPrice(cartItem?.price)} l&apos;unité
            </Text>

            <View className="mt-3">
              {showDeleteConfirm ? (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleDelete}
                    disabled={isDeleting}
                    className="rounded bg-red-600 px-2 py-1 active:bg-red-700 disabled:opacity-50"
                  >
                    <Text className="text-xs text-white">
                      {isDeleting ? "Suppression..." : "Confirmer"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowDeleteConfirm(false)}
                    className="rounded bg-gray-200 px-2 py-1 active:bg-gray-300"
                  >
                    <Text className="text-xs text-gray-800">Annuler</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="flex-row items-center disabled:opacity-50"
                >
                  <Ionicons name="trash-outline" size={14} color="#dc2626" />
                  <Text className="ml-1 text-xs text-red-600">Supprimer</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  },
);

CartItem.displayName = "CartItem";

export default CartItem;
