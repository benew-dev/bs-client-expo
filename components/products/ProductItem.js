// components/products/ProductItem.js
// Équivalent mobile de ProductItem.jsx.

import { memo, useCallback, useContext, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import CartContext from "../../context/CartContext";
import { INCREASE } from "../../helpers/constants";
import { formatPrice } from "../../lib/format";
import { showToast } from "../../lib/toast";

const ProductItem = memo(({ product, user }) => {
  const router = useRouter();
  const { addItemToCart, updateCart, cart } = useContext(CartContext);
  const [imageFailed, setImageFailed] = useState(false);

  const productId = product?._id || "";

  // Les hooks restent avant tout return anticipé
  const addToCartHandler = useCallback(() => {
    try {
      if (!user) {
        showToast("Connectez-vous pour ajouter des articles à votre panier !");
        return;
      }

      const isProductInCart = cart.find((i) => i?.productId === productId);

      if (isProductInCart) {
        updateCart(isProductInCart, INCREASE);
      } else {
        addItemToCart({ product: productId });
      }
    } catch (error) {
      showToast("Impossible d'ajouter au panier. Veuillez réessayer.");
      console.error("Erreur d'ajout au panier:", error);
    }
  }, [user, cart, productId, addItemToCart, updateCart]);

  // Vérification de sécurité pour s'assurer que product est un objet valide
  if (!product || typeof product !== "object") {
    return null;
  }

  const inStock = product.stock > 0;
  const productName = product.name || "Produit sans nom";
  const productDescription = product.description || "";
  const productPrice = product.price || 0;
  const productCategory = product.category?.categoryName || "Non catégorisé";
  const imageUrl = product.images?.[0]?.url;

  return (
    <Pressable
      onPress={() => router.push(`/product/${productId}`)}
      accessibilityLabel={`Voir les détails du produit: ${productName}`}
      className="mb-4 overflow-hidden rounded-sm border border-gray-200 bg-white active:bg-blue-50"
    >
      <View className="p-3">
        <View className="h-52 w-full items-center justify-center">
          {imageUrl && !imageFailed ? (
            <Image
              source={{ uri: imageUrl }}
              className="h-full w-full"
              resizeMode="contain"
              onError={() => setImageFailed(true)}
              accessibilityLabel={productName}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-100">
              <Text className="text-gray-400">Aucune image</Text>
            </View>
          )}
        </View>
      </View>

      <View className="px-4 pb-4">
        <Text className="text-xl font-semibold text-gray-800" numberOfLines={2}>
          {productName}
        </Text>

        <View className="mt-4">
          <Text className="mb-1 text-sm text-gray-700">
            <Text className="font-semibold">Catégorie : </Text>
            {productCategory}
          </Text>
          <Text className="mb-1 text-sm text-gray-700" numberOfLines={2}>
            <Text className="font-semibold">Description : </Text>
            {productDescription
              ? productDescription.substring(0, 45) + "..."
              : "Aucune description disponible"}
          </Text>
          <Text className="mb-1 text-sm text-gray-700">
            <Text className="font-semibold">Stock : </Text>
            {inStock ? (
              <Text className="font-medium text-green-700">En stock</Text>
            ) : (
              <Text className="font-medium text-red-700">Rupture de stock</Text>
            )}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-200 p-4">
        <Text className="text-xl font-semibold text-black">
          {formatPrice(productPrice)}
        </Text>
        <Text className="text-sm text-green-700">Livraison gratuite</Text>

        <Pressable
          disabled={!inStock}
          onPress={addToCartHandler}
          accessibilityLabel={
            inStock ? "Ajouter au panier" : "Produit indisponible"
          }
          accessibilityState={{ disabled: !inStock }}
          className={`mt-3 self-start rounded-md px-4 py-2 ${
            inStock ? "bg-blue-600 active:bg-blue-700" : "bg-gray-400"
          }`}
        >
          <Text className="text-sm text-white">
            {inStock ? "Ajouter au panier" : "Indisponible"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
});

ProductItem.displayName = "ProductItem";

export default ProductItem;
