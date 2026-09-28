// components/layouts/Header.js
// Équivalent mobile de Header.jsx (variante mobile du web) :
// logo, panier + photo de profil (connecté) ou menu (non connecté), et Search.

import { useCallback, useContext, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut, useSession } from "../../lib/auth-client";
import CartContext from "../../context/CartContext";
import Search from "./Search";

// Bouton panier
const CartButton = ({ cartCount, onPress }) => (
  <Pressable
    onPress={onPress}
    className="relative rounded-md border border-gray-200 bg-white px-3 py-2 active:bg-blue-50"
    accessibilityLabel="Panier"
  >
    <Ionicons name="cart-outline" size={22} color="#9ca3af" />
    {cartCount > 0 && (
      <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-red-500">
        <Text className="text-xs text-white">{cartCount}</Text>
      </View>
    )}
  </Pressable>
);

// Photo de profil (initiale du nom si pas d'image)
const Avatar = ({ user, size = 40 }) => {
  const [failed, setFailed] = useState(false);
  const uri = user?.image;
  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        className="rounded-full"
        onError={() => setFailed(true)}
        accessibilityLabel={`Photo de profil de ${user?.name || "utilisateur"}`}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center rounded-full bg-blue-100"
    >
      <Text className="font-semibold text-blue-700">{initial}</Text>
    </View>
  );
};

const MenuLink = ({ label, onPress, danger = false }) => (
  <Pressable
    onPress={onPress}
    className={`rounded-md px-2 py-3 ${
      danger ? "active:bg-red-50" : "active:bg-blue-50"
    }`}
  >
    <Text className={`text-sm ${danger ? "text-red-600" : "text-gray-700"}`}>
      {label}
    </Text>
  </Pressable>
);

const Header = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const { cartCount, clearCartOnLogout } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  const goTo = (href) => {
    closeMenu();
    router.push(href);
  };

  const handleSignOut = useCallback(async () => {
    closeMenu();
    try {
      clearCartOnLogout(); // Nettoyer le panier avant déconnexion
      await signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Même comportement que le web : on redirige vers /login dans tous les cas
      router.replace("/login");
    }
  }, [clearCartOnLogout, router]);

  // Squelette pendant le chargement de la session
  if (isPending) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-gray-200 bg-white px-4 pb-2"
      >
        <View className="flex-row items-center justify-between py-2">
          <View className="h-10 w-32 rounded bg-gray-200" />
          <View className="h-10 w-24 rounded bg-gray-200" />
        </View>
        <View className="h-10 rounded bg-gray-200" />
      </View>
    );
  }

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="border-b border-gray-200 bg-white px-4 pb-2"
    >
      {/* Ligne 1 : logo + actions */}
      <View className="flex-row items-center justify-between py-2">
        <Pressable
          onPress={() => {
            closeMenu();
            router.replace("/");
          }}
          accessibilityLabel="Accueil Buy It Now"
        >
          {/* Remplacer par <Image source={require("../../assets/images/logo.png")} /> */}
          <Text className="text-2xl font-extrabold text-blue-600">
            BuyItNow
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-2">
          {user ? (
            <>
              <CartButton cartCount={cartCount} onPress={() => goTo("/cart")} />
              <Pressable
                onPress={toggleMenu}
                className="rounded-full border-2 border-gray-200 active:border-blue-400"
                accessibilityLabel={
                  menuOpen ? "Fermer le menu" : "Ouvrir le menu"
                }
                accessibilityState={{ expanded: menuOpen }}
              >
                <Avatar user={user} size={36} />
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={toggleMenu}
              className="rounded-md border border-gray-200 px-3 py-2"
              accessibilityLabel={
                menuOpen ? "Fermer le menu" : "Ouvrir le menu"
              }
              accessibilityState={{ expanded: menuOpen }}
            >
              <Ionicons
                name={menuOpen ? "close" : "menu"}
                size={24}
                color="#374151"
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Menu */}
      {menuOpen && (
        <View className="mb-2 border-t border-gray-200 pt-2">
          {user ? (
            <>
              <MenuLink label="Mon profil" onPress={() => goTo("/me")} />
              <MenuLink
                label="Mes commandes"
                onPress={() => goTo("/me/orders")}
              />
              <MenuLink
                label="Contactez le vendeur"
                onPress={() => goTo("/me/contact")}
              />
              <MenuLink label="Déconnexion" onPress={handleSignOut} danger />
            </>
          ) : (
            <Pressable
              onPress={() => goTo("/login")}
              className="items-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
            >
              <Text className="text-white">Connexion</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Barre de recherche */}
      <View className="pb-1">
        <Search />
      </View>
    </View>
  );
};

export default Header;
