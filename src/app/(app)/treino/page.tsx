import { redirect } from "next/navigation";
import { jsDayToIndex } from "@/lib/utils/formatters";

export default function TreinoPage() {
  const todayIndex = jsDayToIndex(new Date().getDay());
  redirect(`/treino/${todayIndex}`);
}
