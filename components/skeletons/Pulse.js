// components/skeletons/Pulse.js
// Équivalent mobile de "animate-pulse" (Tailwind) : un bloc gris dont
// l'opacité oscille en boucle.

import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const Pulse = ({ className = "", style }) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`rounded bg-gray-200 ${className}`}
      style={[{ opacity }, style]}
    />
  );
};

export default Pulse;
