// lib/toast.js
// Équivalent mobile de react-toastify (l'app ne cible qu'Android).

import { Alert, Platform, ToastAndroid } from "react-native";

export const showToast = (message) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(message);
  }
};
