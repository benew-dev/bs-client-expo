// components/layouts/Search.js
// Équivalent mobile de Search.jsx.

import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../../lib/toast";

const DEBOUNCE_DELAY = 300;

const Search = () => {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();
  const timeoutRef = useRef(null);

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Soumission avec debounce (300 ms), comme sur le web
  const handleSubmit = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const trimmed = keyword.trim();

      if (!trimmed) {
        showToast("Veuillez entrer un terme de recherche");
        return;
      }

      Keyboard.dismiss();
      // Équivalent de router.push(`/?keyword=...`)
      router.push({ pathname: "/", params: { keyword: trimmed } });
    }, DEBOUNCE_DELAY);
  }, [keyword, router]);

  return (
    <View className="w-full flex-row items-center" accessibilityRole="search">
      <TextInput
        className="mr-2 flex-1 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-base text-gray-900"
        placeholder="Rechercher un produit..."
        placeholderTextColor="#9ca3af"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Terme de recherche"
      />
      <Pressable
        onPress={handleSubmit}
        className="rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
        accessibilityLabel="Lancer la recherche"
      >
        <Ionicons name="search" size={20} color="#ffffff" />
      </Pressable>
    </View>
  );
};

export default Search;
