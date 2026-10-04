// app/me/index.js
// Équivalent mobile de app/me/page.jsx.
// La session est déjà vérifiée par app/me/_layout.js.

import Profile from "../../components/profile/Profile";

export default function ProfileScreen() {
  return <Profile />;
}
