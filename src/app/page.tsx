/**
 * Page d'accueil — Redirect vers la bibliothèque.
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/library");
}
