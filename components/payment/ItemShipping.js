// components/payment/ItemShipping.js
// Équivalent mobile de ItemShipping.jsx.

import { memo, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { formatPrice } from "../../helpers/helpers";

const ItemShipping = memo(({ item }) => {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);

  const quantity = item?.quantity || 1;
  const productId = item?.productId || "unknown";
  const productName = item?.productName || "Produit sans nom";

  const total = useMemo(() => {
    if (typeof item?.subtotal === "number") return item.subtotal;
    const price = typeof item?.price === "number" ? item.price : 0;
    return quantity * price;
  }, [item?.subtotal, item?.price, quantity]);

  return (
    <Pressable
      onPress={() => router.push(`/product/${productId}`)}
      className="flex-row items-center py-2"
    >
      <View className="relative mr-3 h-16 w-16 overflow-hidden rounded border border-gray-200 bg-gray-50 p-1">
        {item?.imageUrl && !imageFailed ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-full w-full"
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-[10px] text-gray-400">Aucune image</Text>
          </View>
        )}

        {quantity >= 1 && (
          <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-blue-600">
            <Text className="text-xs text-white">{quantity}</Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
          {productName}
        </Text>

        <View className="mt-1 flex-row items-baseline justify-between">
          <Text className="text-xs text-gray-500">{formatPrice(total)}</Text>
          {quantity >= 1 && (
            <Text className="text-xs text-gray-400">
              {quantity} × {formatPrice(item?.price || 0)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ItemShipping.displayName = "ItemShipping";

export default ItemShipping;
