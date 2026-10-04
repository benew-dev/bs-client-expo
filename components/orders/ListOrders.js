// components/orders/ListOrders.js
// Équivalent mobile de ListOrders.jsx.
// Filtres/tri : <select> HTML remplacés par des chips pressables (pas
// d'équivalent natif). Pagination : réutilise le CustomPagination déjà
// construit pour la liste produits (gère seul le paramètre "page" de la
// route), donc pas besoin de currentPage/onPageChange ici.

import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import OrderItem from "./OrderItem";
import CustomPagination from "../layouts/CustomPagination";

const STATUS_FILTERS = [
  { value: "all", label: "Tous les statuts" },
  { value: "paid", label: "✓ Payées" },
  { value: "unpaid", label: "✗ Non payées" },
  { value: "pending_cash", label: "💵 En attente (Espèces)" },
  { value: "cash", label: "💰 Paiement en espèces" },
  { value: "processing", label: "⏳ En traitement" },
  { value: "refunded", label: "↩ Remboursées" },
  { value: "failed", label: "⚠ Échouées" },
  { value: "cancelled", label: "🚫 Annulées" },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Plus récentes" },
  { value: "asc", label: "Plus anciennes" },
];

const Chip = ({ label, selected, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`mr-2 rounded-full border px-3 py-1.5 ${
      selected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
    }`}
  >
    <Text
      className={`text-xs font-medium ${selected ? "text-white" : "text-gray-700"}`}
    >
      {label}
    </Text>
  </Pressable>
);

const StatCard = ({ label, value, className = "" }) => (
  <View className={`flex-1 rounded-md border p-3 ${className}`}>
    <Text className="text-xs text-gray-600">{label}</Text>
    <Text className="text-lg font-bold">{value}</Text>
  </View>
);

const ListOrders = ({ orders }) => {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const hasOrders = useMemo(
    () =>
      orders?.orders &&
      Array.isArray(orders.orders) &&
      orders.orders.length > 0,
    [orders],
  );

  const totalPages = useMemo(
    () =>
      orders?.totalPages && !isNaN(parseInt(orders.totalPages))
        ? parseInt(orders.totalPages)
        : 1,
    [orders],
  );

  const cashOrdersCount = useMemo(() => {
    if (!hasOrders) return 0;
    return orders.orders.filter((order) => order.isCashPayment).length;
  }, [hasOrders, orders]);

  const filteredAndSortedOrders = useMemo(() => {
    if (!hasOrders) return [];

    let filtered = [...orders.orders];

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => {
        if (filterStatus === "paid") return order.paymentStatus === "paid";
        if (filterStatus === "unpaid") return order.paymentStatus === "unpaid";
        if (filterStatus === "processing")
          return order.paymentStatus === "processing";
        if (filterStatus === "refunded")
          return order.paymentStatus === "refunded";
        if (filterStatus === "failed") return order.paymentStatus === "failed";
        if (filterStatus === "pending_cash")
          return order.paymentStatus === "pending_cash" || order.isCashPayment;
        if (filterStatus === "cash") return order.isCashPayment === true;
        if (filterStatus === "cancelled") return !!order.cancelledAt;
        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [hasOrders, orders?.orders, filterStatus, sortOrder]);

  return (
    <View>
      <Text className="mb-4 text-xl font-semibold">
        Historique de vos commandes
      </Text>

      {hasOrders && (
        <>
          {/* Filtres */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            {STATUS_FILTERS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={filterStatus === opt.value}
                onPress={() => setFilterStatus(opt.value)}
              />
            ))}
          </ScrollView>

          {/* Tri */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={sortOrder === opt.value}
                onPress={() => setSortOrder(opt.value)}
              />
            ))}
          </ScrollView>

          {/* Statistiques */}
          <View className="mb-3 flex-row gap-2">
            <StatCard
              label="Total commandes"
              value={orders.count}
              className="border-gray-200 bg-gray-50"
            />
            <StatCard
              label="Payées"
              value={orders.paidCount}
              className="border-green-200 bg-green-50"
            />
          </View>
          <View className="mb-3 flex-row gap-2">
            <StatCard
              label="Non payées"
              value={orders.unpaidCount}
              className="border-red-200 bg-red-50"
            />
            <StatCard
              label="En espèces"
              value={orders.pendingCashCount || cashOrdersCount}
              className="border-amber-200 bg-amber-50"
            />
          </View>
          <View className="mb-6">
            <StatCard
              label="Montant total"
              value={`$${orders.totalAmountOrders?.totalAmount?.toFixed(2) || "0.00"}`}
              className="border-purple-200 bg-purple-50"
            />
          </View>

          {cashOrdersCount > 0 && (
            <View className="mb-6 flex-row rounded-lg border border-green-200 bg-green-50 p-4">
              <Ionicons name="cash-outline" size={20} color="#16a34a" />
              <View className="ml-3 flex-1">
                <Text className="mb-1 font-semibold text-green-800">
                  Commandes avec paiement en espèces
                </Text>
                <Text className="text-sm text-green-700">
                  Vous avez {cashOrdersCount} commande
                  {cashOrdersCount > 1 ? "s" : ""} avec paiement en espèces. Le
                  paiement sera effectué lors de la récupération.
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      {!hasOrders ? (
        <View className="items-center rounded-lg border border-gray-200 bg-gray-50 p-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Ionicons name="bag-outline" size={32} color="#2563eb" />
          </View>
          <Text className="mb-2 text-lg font-semibold">Aucune commande</Text>
          <Text className="mb-4 text-center text-gray-600">
            Vous n&apos;avez pas encore effectué de commande.
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            className="rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
          >
            <Text className="text-white">Découvrir nos produits</Text>
          </Pressable>
        </View>
      ) : filteredAndSortedOrders.length === 0 ? (
        <View className="items-center rounded-md border border-yellow-200 bg-yellow-50 p-6">
          <Text className="text-yellow-800">
            Aucune commande ne correspond à vos filtres.
          </Text>
          <Pressable onPress={() => setFilterStatus("all")} className="mt-3">
            <Text className="text-blue-600 underline">
              Réinitialiser les filtres
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredAndSortedOrders}
            keyExtractor={(order) => order._id}
            renderItem={({ item }) => <OrderItem order={item} />}
            scrollEnabled={false}
          />

          {totalPages > 1 && filterStatus === "all" && (
            <View className="mt-4">
              <CustomPagination totalPages={totalPages} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default ListOrders;
