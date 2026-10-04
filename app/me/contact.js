// app/me/contact.js
// Équivalent mobile de app/me/contact/page.jsx.
// La session est déjà vérifiée par app/me/_layout.js.
// Les vérifications de referrer du web (CSRF via header "referer") n'ont
// pas d'équivalent pertinent dans une app native : une requête mobile
// n'a pas de "referrer" de navigateur à valider.

import Contact from "../../components/profile/Contact";

export default function ContactScreen() {
  return <Contact />;
}
