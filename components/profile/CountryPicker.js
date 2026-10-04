// components/profile/CountryPicker.js
// Équivalent mobile du <select> de pays du web (countries-list) : un Modal
// avec une liste filtrable, pas d'équivalent natif à <select> en RN.

import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { countries } from "countries-list";
import { Ionicons } from "@expo/vector-icons";

const COUNTRIES_LIST = Object.values(countries).sort((a, b) =>
  a.name.localeCompare(b.name),
);

const CountryPicker = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES_LIST;
    const q = search.trim().toLowerCase();
    return COUNTRIES_LIST.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  const select = (name) => {
    onChange(name);
    setOpen(false);
    setSearch("");
  };

  return (
    <View>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        className="flex-row items-center justify-between rounded-md border border-gray-200 bg-gray-100 px-3 py-2"
      >
        <Text className={value ? "text-gray-900" : "text-gray-400"}>
          {value || "Sélectionnez un pays"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 bg-white pt-14">
          <View className="flex-row items-center border-b border-gray-200 px-4 pb-3">
            <Pressable onPress={() => setOpen(false)} className="mr-3">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
            <TextInput
              autoFocus
              className="flex-1 rounded-md border border-gray-200 bg-gray-100 px-3 py-2"
              placeholder="Rechercher un pays..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => select(item.name)}
                className="border-b border-gray-100 px-4 py-3 active:bg-gray-50"
              >
                <Text className="text-gray-800">{item.name}</Text>
              </Pressable>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </View>
  );
};

export default CountryPicker;
