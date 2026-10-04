// hooks/useCartOperations.js
// Équivalent mobile de useCartOperations.js.
// NOTE : web déstructure aussi `saveOnCheckout` et expose `checkoutHandler`,
// mais ce champ n'existe pas dans CartContext (ni web ni mobile tels que
// fournis). Omis ici en attendant le contexte/la page de paiement.

import { useContext, useState } from "react";
import { captureClientError } from "../lib/monitoring";
import CartContext from "../context/CartContext";
import { DECREASE, INCREASE } from "../helpers/constants";

const useCartOperations = () => {
  const { updateCart, deleteItemFromCart } = useContext(CartContext);

  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [itemBeingRemoved, setItemBeingRemoved] = useState(null);

  const increaseQty = async (cartItem) => {
    try {
      await updateCart(cartItem, INCREASE);
    } catch (error) {
      console.error("Erreur lors de l'augmentation de la quantité:", error);
      captureClientError(error, "Cart", "increaseQty", false);
    }
  };

  const decreaseQty = async (cartItem) => {
    try {
      await updateCart(cartItem, DECREASE);
    } catch (error) {
      console.error("Erreur lors de la diminution de la quantité:", error);
      captureClientError(error, "Cart", "decreaseQty", false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setDeleteInProgress(true);
      setItemBeingRemoved(itemId);
      await deleteItemFromCart(itemId);
    } catch (error) {
      console.error("Erreur lors de la suppression d'un article:", error);
      captureClientError(error, "Cart", "deleteItem", false);
    } finally {
      setDeleteInProgress(false);
      setItemBeingRemoved(null);
    }
  };

  return {
    deleteInProgress,
    itemBeingRemoved,
    increaseQty,
    decreaseQty,
    handleDeleteItem,
  };
};

export default useCartOperations;
