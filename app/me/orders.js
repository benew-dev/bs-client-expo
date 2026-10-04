// app/me/orders.js
// Équivalent mobile de app/me/orders/page.jsx.
// La session est déjà vérifiée par app/me/_layout.js ; cet écran se
// contente de récupérer les commandes via /api/v1/orders/me.

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { authenticatedFetch } from "../../lib/auth-client";
import { showToast } from "../../lib/toast";
import ListOrders from "../../components/orders/ListOrders";

const EMPTY_ORDERS = {
  orders: [],
  totalPages: 0,
  currentPage: 1,
  count: 0,
  paidCount: 0,
  unpaidCount: 0,
  pendingCashCount: 0,
  totalAmountOrders: { totalAmount: 0, orderCount: 0 },
};

const first = (value) => (Array.isArray(value) ? value[0] : value);

export default function MyOrdersScreen() {
  const params = useLocalSearchParams();
  const page = first(params.page) || "1";

  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const res = await authenticatedFetch(`/api/v1/orders/me?page=${page}`, {
        method: "GET",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
        } else {
          setError(
            data.message || "Erreur lors de la récupération des commandes",
          );
        }
        setOrders(EMPTY_ORDERS);
        return;
      }

      if (data.success) {
        setOrders(data.data || EMPTY_ORDERS);
      } else {
        setError(data.message || "Réponse API invalide");
        setOrders(EMPTY_ORDERS);
      }
    } catch (err) {
      console.error("Orders fetch error:", err.message);
      setError(
        err.name === "AbortError"
          ? "La requête a pris trop de temps"
          : "Problème de connexion réseau",
      );
      setOrders(EMPTY_ORDERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page]);

  useEffect(() => {
    if (error) {
      showToast(error);
    }
  }, [error]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders({ silent: true });
  };

  if (loading && !orders) {
    return (
      <View className="flex-1 items-center justify-center py-10">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error && orders?.count === 0) {
    return (
      <View className="rounded-md border border-red-200 bg-red-50 p-4">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <ListOrders orders={orders || EMPTY_ORDERS} />
    </ScrollView>
  );
}
