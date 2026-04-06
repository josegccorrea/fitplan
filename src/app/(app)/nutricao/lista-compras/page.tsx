"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Loader2, RefreshCw, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ShoppingList, ShoppingItem } from "@/types/database";

export default function ListaComprasPage() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [periodType, setPeriodType] = useState<"semanal" | "mensal">("semanal");

  useEffect(() => {
    loadList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType]);

  async function loadList() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Busca a lista mais recente independente da semana — persiste até o usuário atualizar
    const { data } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("user_id", user.id)
      .eq("period_type", periodType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setList(data as ShoppingList | null);
    setLoading(false);
  }

  async function generateList() {
    setGenerating(true);
    const res = await fetch("/api/shopping-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period_type: periodType }),
    });
    const data = await res.json();
    if (data.list) setList(data.list);
    setGenerating(false);
  }

  async function toggleItem(categoryIndex: number, itemIndex: number) {
    if (!list) return;
    const supabase = createClient();

    const newItems = list.items.map((cat, ci) => ({
      ...cat,
      items: cat.items.map((item, ii) =>
        ci === categoryIndex && ii === itemIndex
          ? { ...item, checked: !item.checked }
          : item
      ),
    }));

    setList({ ...list, items: newItems });
    await supabase.from("shopping_lists").update({ items: newItems }).eq("id", list.id);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-ember" />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Lista de Compras</h1>
          <p className="text-xs text-muted-foreground">Baseada no seu plano alimentar</p>
        </div>
        <ShoppingCart className="w-5 h-5 text-ember" />
      </div>

      {/* Period toggle */}
      <div className="flex gap-2">
        {(["semanal", "mensal"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodType(p)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors capitalize ${
              periodType === p ? "bg-ember border-ember text-white" : "bg-surface2 border-border text-muted-foreground"
            }`}
          >
            {p === "semanal" ? "Semanal" : "Mensal"}
          </button>
        ))}
      </div>

      {!list ? (
        <div className="bg-surface2 border border-border rounded-xl p-6 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Gere sua lista de compras a partir do seu plano alimentar.
          </p>
          <button
            onClick={generateList}
            disabled={generating}
            className="flex items-center gap-2 mx-auto bg-ember hover:bg-ember-hover text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {generating ? "Gerando..." : "Gerar Lista"}
          </button>
        </div>
      ) : (
        <>
          {/* Refresh */}
          <div className="flex justify-end">
            <button
              onClick={generateList}
              disabled={generating}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
              Atualizar lista
            </button>
          </div>

          {/* Categories */}
          {list.items.map((category, ci) => (
            <div key={ci} className="bg-surface2 border border-border rounded-xl overflow-hidden">
              <div className="px-3.5 py-2.5 bg-surface border-b border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {category.category}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {category.items.map((item: ShoppingItem, ii) => (
                  <button
                    key={ii}
                    onClick={() => toggleItem(ci, ii)}
                    className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-surface/50 transition-colors text-left"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      item.checked ? "border-success bg-success" : "border-border"
                    }`}>
                      {item.checked && <Check className="w-3 h-3 text-background" />}
                    </div>
                    <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ember">
                      {item.quantity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
