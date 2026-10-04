// components/orders/OrderedProduct.js
// Équivalent mobile de OrderedProduct.jsx.
// NOTE : formatPrice ici utilise "$" en dur, comme le fichier web d'origine
// (incohérent avec le reste de l'app qui utilise Fdj) — reproduit tel quel.

import { memo, useState } from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const formatPrice = (amount) => `$${(amount || 0).toFixed(2)}`;

const OrderedProduct = memo(({ item }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!item) return null;

  const {
    name = "Produit",
    category = "Non catégorisé",
    image,
    price = 0,
    quantity = 1,
    subtotal,
  } = item;

  const calculatedSubtotal = subtotal || price * quantity;

  return (
    <View className="flex-row rounded-lg border border-gray-200 bg-white p-3">
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {image && !imageFailed ? (
          <Image
            source={{ uri: image }}
            className="h-full w-full"
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Text className="text-[10px] text-gray-400">Aucune image</Text>
        )}
      </View>

      <View className="ml-3 flex-1 justify-between">
        <View>
          <Text className="mb-1 text-sm font-semibold text-gray-900">
            {truncateText(name, 35)}
          </Text>

          <View className="mb-1 flex-row items-center">
            <Ionicons name="pricetag-outline" size={12} color="#6b7280" />
            <Text className="ml-1 text-xs text-gray-500">{category}</Text>
          </View>

          <Text className="text-sm text-gray-600">
            Prix unitaire :{" "}
            <Text className="font-medium">{formatPrice(price)}</Text>
          </Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-2">
          <Text className="text-sm text-gray-600">
            Quantité :{" "}
            <Text className="font-semibold text-gray-900">{quantity}</Text>
          </Text>
          <View className="items-end">
            <Text className="text-xs text-gray-500">Sous-total</Text>
            <Text className="font-bold text-blue-600">
              {formatPrice(calculatedSubtotal)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
});

OrderedProduct.displayName = "OrderedProduct";

export default OrderedProduct;
