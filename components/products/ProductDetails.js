// components/products/ProductDetails.js
// Équivalent mobile de ProductDetails.jsx.

import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CartContext from "../../context/CartContext";
import { INCREASE } from "../../helpers/constants";
import { formatPrice, stripHtml } from "../../lib/format";
import { showToast } from "../../lib/toast";
import { useSession } from "../../lib/auth-client";
import BreadCrumbs from "../layouts/BreadCrumbs";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const isRecent = (createdAt) =>
  createdAt && new Date(createdAt) > new Date(Date.now() - THIRTY_DAYS);

// ---------- Galerie d'images ----------
const ProductImageGallery = memo(function ProductImageGallery({
  product,
  selectedImage,
  onImageSelect,
}) {
  const [failedUrls, setFailedUrls] = useState({});
  const markFailed = (url) =>
    setFailedUrls((prev) => ({ ...prev, [url]: true }));

  const productImages = product?.images?.length > 0 ? product.images : [];
  const mainFailed = !selectedImage || failedUrls[selectedImage];

  return (
    <View className="mb-5">
      <View className="mb-5 h-72 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-3">
        {!mainFailed ? (
          <Image
            source={{ uri: selectedImage }}
            className="h-full w-full"
            resizeMode="contain"
            onError={() => markFailed(selectedImage)}
            accessibilityLabel={product?.name || "Product image"}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-100">
            <Text className="text-gray-400">Aucune image</Text>
          </View>
        )}
      </View>

      {productImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          accessibilityLabel="Product thumbnail images"
        >
          {productImages.map((img, index) => {
            const selected = selectedImage === img?.url;
            return (
              <Pressable
                key={img?.url || `img-${index}`}
                onPress={() => onImageSelect(img?.url)}
                accessibilityLabel={`View product image ${index + 1}`}
                accessibilityState={{ selected }}
                className={`mr-2 rounded-lg border p-1 ${
                  selected ? "border-blue-500" : "border-gray-200"
                }`}
              >
                {img?.url && !failedUrls[img.url] ? (
                  <Image
                    source={{ uri: img.url }}
                    className="h-14 w-14"
                    resizeMode="contain"
                    onError={() => markFailed(img.url)}
                  />
                ) : (
                  <View className="h-14 w-14 bg-gray-100" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
});

// ---------- Informations produit ----------
const ProductInfo = memo(function ProductInfo({
  product,
  inStock,
  onAddToCart,
  isAddingToCart,
  onShare,
}) {
  const formattedPrice = useMemo(
    () => formatPrice(product?.price),
    [product?.price],
  );

  return (
    <View>
      <Text className="mb-4 text-xl font-semibold text-gray-800">
        {product?.name || "Product Not Available"}
      </Text>

      {product?.verified && (
        <View className="mb-2 flex-row items-center">
          <Ionicons name="checkmark-circle" size={18} color="#15803d" />
          <Text className="ml-1 text-green-700">Vérifié</Text>
        </View>
      )}

      <View className="mb-4 flex-row flex-wrap items-baseline">
        <Text
          className="mr-3 text-xl font-semibold text-blue-600"
          accessibilityLabel="Prix"
        >
          {formattedPrice}
        </Text>
        {product?.oldPrice && (
          <Text className="text-sm text-gray-500 line-through">
            {formatPrice(product.oldPrice)}
          </Text>
        )}
      </View>

      {/* Description en texte brut (React Native n'affiche pas de HTML) */}
      <Text className="mb-6 leading-6 text-gray-600">
        {product?.description
          ? stripHtml(product.description)
          : "Aucune description disponible pour ce produit."}
      </Text>

      <View className="mb-6">
        <Pressable
          disabled={!inStock || isAddingToCart}
          onPress={onAddToCart}
          accessibilityLabel={
            inStock ? "Ajouter au panier" : "Produit indisponible"
          }
          className={`mb-3 flex-row items-center justify-center rounded-lg px-6 py-3 ${
            inStock ? "bg-blue-600 active:bg-blue-700" : "bg-gray-400"
          }`}
        >
          {isAddingToCart ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="ml-2 font-medium text-white">
                Ajout en cours...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="cart-outline" size={20} color="#ffffff" />
              <Text className="ml-2 font-medium text-white">
                {inStock ? "Ajouter au panier" : "Indisponible"}
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={onShare}
          accessibilityLabel="Partager ce produit"
          className="flex-row items-center justify-center rounded-lg border border-blue-600 px-4 py-2 active:bg-blue-50"
        >
          <Ionicons name="share-social-outline" size={20} color="#2563eb" />
          <Text className="ml-1 text-blue-600">Partager</Text>
        </Pressable>
      </View>

      {/* Informations supplémentaires */}
      <View className="mb-5">
        <View className="mb-2 flex-row">
          <Text className="w-32 font-medium text-gray-600">
            Disponibilité :
          </Text>
          {inStock ? (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text className="ml-1 font-medium text-green-600">En stock</Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={16} color="#dc2626" />
              <Text className="ml-1 font-medium text-red-600">
                Rupture de stock
              </Text>
            </View>
          )}
        </View>
        <View className="mb-2 flex-row">
          <Text className="w-32 font-medium text-gray-600">Quantité :</Text>
          <Text className="text-gray-600">{product?.stock || 0} unité(s)</Text>
        </View>
        <View className="mb-2 flex-row">
          <Text className="w-32 font-medium text-gray-600">Catégorie :</Text>
          <Text className="flex-1 text-gray-600">
            {product?.category?.categoryName || "Non catégorisé"}
          </Text>
        </View>
        <View className="mb-2 flex-row">
          <Text className="w-32 font-medium text-gray-600">Référence :</Text>
          <Text className="flex-1 font-mono text-sm text-gray-600">
            {product?._id || "N/A"}
          </Text>
        </View>
      </View>

      {/* Badge de popularité basé sur les ventes */}
      {product?.sold > 10 && (
        <View className="mt-2 flex-row items-center self-start rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
          <Ionicons name="car-outline" size={18} color="#b45309" />
          <Text className="ml-1 text-sm text-amber-700">
            {product.sold > 100 ? "Très populaire" : "Populaire"}
          </Text>
        </View>
      )}

      {/* Produit récent (moins de 30 jours) */}
      {isRecent(product?.createdAt) && (
        <View className="mt-4 flex-row items-center self-start rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <Ionicons name="star-outline" size={18} color="#1d4ed8" />
          <Text className="ml-1 text-sm text-blue-700">Nouveau</Text>
        </View>
      )}
    </View>
  );
});

// ---------- Carrousel des produits similaires ----------
const RelatedProductsCarousel = memo(function RelatedProductsCarousel({
  products,
  currentProductId,
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const currentSlideRef = useRef(0);

  const [containerWidth, setContainerWidth] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Nombre de slides visibles (mêmes seuils que le web)
  const slidesPerView =
    width < 640 ? 1 : width < 768 ? 2 : width < 1024 ? 3 : 4;

  const filteredProducts = useMemo(
    () =>
      products?.filter((product) => product?._id !== currentProductId) || [],
    [products, currentProductId],
  );

  const maxSlideIndex = Math.max(0, filteredProducts.length - slidesPerView);
  const slideWidth = containerWidth / slidesPerView;

  const goToSlide = useCallback(
    (index) => {
      currentSlideRef.current = index;
      setCurrentSlide(index);
      listRef.current?.scrollToOffset({
        offset: index * slideWidth,
        animated: true,
      });
    },
    [slideWidth],
  );

  // Auto-scroll toutes les 4 secondes
  useEffect(() => {
    if (
      !isAutoScrolling ||
      filteredProducts.length <= slidesPerView ||
      slideWidth === 0
    ) {
      return;
    }

    const interval = setInterval(() => {
      const next =
        currentSlideRef.current >= maxSlideIndex
          ? 0
          : currentSlideRef.current + 1;
      goToSlide(next);
    }, 4000);

    return () => clearInterval(interval);
  }, [
    isAutoScrolling,
    maxSlideIndex,
    filteredProducts.length,
    slidesPerView,
    slideWidth,
    goToSlide,
  ]);

  // Reprise de l'auto-scroll après 10 secondes d'inactivité
  useEffect(() => {
    if (!isAutoScrolling) {
      const timeout = setTimeout(() => setIsAutoScrolling(true), 10000);
      return () => clearTimeout(timeout);
    }
  }, [isAutoScrolling]);

  const handleMomentumEnd = (event) => {
    if (slideWidth === 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const clamped = Math.min(Math.max(index, 0), maxSlideIndex);
    currentSlideRef.current = clamped;
    setCurrentSlide(clamped);
  };

  // Rien à afficher (les hooks sont tous appelés avant ce return)
  if (filteredProducts.length === 0) {
    return null;
  }

  const totalDots =
    filteredProducts.length <= slidesPerView ? 0 : maxSlideIndex + 1;

  const renderItem = ({ item: product }) => (
    <View style={{ width: slideWidth }} className="px-2">
      <Pressable
        onPress={() => router.push(`/product/${product?._id}`)}
        className="h-full rounded-lg border border-gray-200 bg-white p-4 active:border-blue-100"
      >
        <View className="mb-4 aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product?.images?.[0]?.url ? (
            <Image
              source={{ uri: product.images[0].url }}
              className="h-full w-full"
              resizeMode="contain"
              accessibilityLabel={product?.name || "Produit similaire"}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-gray-400">Aucune image</Text>
            </View>
          )}

          {isRecent(product?.createdAt) && (
            <View className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1">
              <Text className="text-xs font-medium text-white">Nouveau</Text>
            </View>
          )}

          {product?.stock === 0 && (
            <View className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1">
              <Text className="text-xs font-medium text-white">Épuisé</Text>
            </View>
          )}
        </View>

        <Text
          className="mb-2 text-sm font-medium text-gray-800"
          numberOfLines={2}
        >
          {product?.name || "Produit sans nom"}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-blue-600">
            {formatPrice(product?.price)}
          </Text>
          {product?.stock > 0 && (
            <Text className="text-xs font-medium text-green-600">En stock</Text>
          )}
        </View>

        {product?.category?.categoryName && (
          <Text className="mt-2 text-xs text-gray-500">
            {product.category.categoryName}
          </Text>
        )}
      </Pressable>
    </View>
  );

  return (
    <View className="mt-12">
      <View className="mb-6 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-800">
          Produits similaires
        </Text>
        <Text className="text-sm text-gray-500">
          {filteredProducts.length} produit
          {filteredProducts.length > 1 ? "s" : ""}
        </Text>
      </View>

      <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        {containerWidth > 0 && (
          <FlatList
            ref={listRef}
            data={filteredProducts}
            keyExtractor={(item, index) => item?._id || `related-${index}`}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={slideWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: slideWidth,
              offset: slideWidth * index,
              index,
            })}
            onScrollBeginDrag={() => setIsAutoScrolling(false)}
            onMomentumScrollEnd={handleMomentumEnd}
          />
        )}
      </View>

      {totalDots > 1 && (
        <View className="mt-4 flex-row items-center justify-center">
          {Array.from({ length: totalDots }).map((_, dotIndex) => (
            <Pressable
              key={dotIndex}
              onPress={() => {
                goToSlide(dotIndex);
                setIsAutoScrolling(false);
              }}
              accessibilityLabel={`Aller à la position ${dotIndex + 1}`}
              className={`mx-1 h-2 rounded-full ${
                dotIndex === currentSlide
                  ? "w-6 bg-blue-600"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}

      {filteredProducts.length <= slidesPerView && (
        <Text className="mt-4 text-center text-sm text-gray-500">
          Tous les produits similaires sont affichés
        </Text>
      )}
    </View>
  );
});

// ---------- Composant principal ----------
function ProductDetails({ product, sameCategoryProducts }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const { addItemToCart, updateCart, cart, error, clearError } =
    useContext(CartContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Image sélectionnée au chargement ou quand le produit change
  useEffect(() => {
    setSelectedImage(
      product?.images?.length > 0 ? product.images[0]?.url : null,
    );
  }, [product]);

  // Erreurs du contexte panier
  useEffect(() => {
    if (error) {
      showToast(error);
      clearError();
    }
  }, [error, clearError]);

  const inStock = useMemo(() => {
    if (!product || product?.stock === undefined) return false;
    return product.stock >= 1;
  }, [product]);

  const breadCrumbs = useMemo(() => {
    if (!product) return null;

    return [
      { name: "Produits", url: "/" },
      {
        name: product.category?.categoryName || "Catégorie",
        url: `/?category=${product.category?._id || "all"}`,
      },
      {
        name: product.name
          ? product.name.length > 40
            ? `${product.name.substring(0, 40)}...`
            : product.name
          : "Produit",
        url: `/product/${product._id}`,
      },
    ];
  }, [product]);

  // Ajout au panier : on attend le résultat, le contexte affiche lui-même
  // le message de succès ou d'erreur
  const handleAddToCart = useCallback(async () => {
    if (!product || !product._id) {
      showToast("Produit invalide");
      return;
    }

    if (!user) {
      showToast(
        "Veuillez vous connecter pour ajouter des articles à votre panier",
      );
      return;
    }

    if (!inStock) {
      showToast("Ce produit est en rupture de stock");
      return;
    }

    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      const isProductInCart = cart.find((i) => i?.productId === product._id);

      if (isProductInCart) {
        await updateCart(isProductInCart, INCREASE);
      } else {
        await addItemToCart({ product: product._id });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showToast("Erreur lors de l'ajout au panier. Veuillez réessayer.");
    } finally {
      // Délai minimum pour éviter le clignotement de l'interface
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  }, [product, user, cart, inStock, addItemToCart, updateCart, isAddingToCart]);

  // Partage (lien vers la page produit du site web)
  const handleShare = useCallback(async () => {
    try {
      const url = `${process.env.EXPO_PUBLIC_API_URL}/product/${product?._id}`;
      await Share.share({
        title: product?.name || "Découvrez ce produit",
        message: `Découvrez ${product?.name} sur notre boutique. ${url}`,
      });
    } catch (error) {
      console.error("Erreur lors du partage:", error);
    }
  }, [product]);

  const handleImageSelect = useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
  }, []);

  // Produit introuvable
  if (!product) {
    return (
      <View className="flex-1 justify-center px-4 py-16">
        <View className="items-center rounded-lg bg-white p-8">
          <Ionicons name="sad-outline" size={48} color="#9ca3af" />
          <Text className="mb-2 mt-4 text-xl font-semibold text-gray-700">
            Produit non disponible
          </Text>
          <Text className="mb-6 text-center text-gray-600">
            Le produit demandé n&apos;existe pas ou a été retiré de notre
            catalogue.
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            className="rounded-lg bg-blue-600 px-6 py-3 active:bg-blue-700"
          >
            <Text className="text-white">Retour à l&apos;accueil</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      keyboardShouldPersistTaps="handled"
    >
      {breadCrumbs && <BreadCrumbs breadCrumbs={breadCrumbs} />}

      <View className="px-4 py-6">
        <View className="rounded-lg border border-gray-100 bg-white p-4">
          <ProductImageGallery
            product={product}
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
          />

          <ProductInfo
            product={product}
            inStock={inStock}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
            onShare={handleShare}
          />

          {/* Spécifications produit */}
          {product.specifications && (
            <View className="mt-8 border-t border-gray-200 pt-8">
              <Text className="mb-4 text-xl font-semibold">Spécifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} className="mb-2 flex-row">
                  <Text className="w-32 font-medium">{key} :</Text>
                  <Text className="flex-1">{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Produits connexes */}
        <RelatedProductsCarousel
          products={sameCategoryProducts}
          currentProductId={product._id}
        />
      </View>
    </ScrollView>
  );
}

export default memo(ProductDetails);
