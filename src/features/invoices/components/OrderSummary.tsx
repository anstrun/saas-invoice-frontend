import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/shared/components/ui/input";
import { Check, X, Package, AlertCircle } from "lucide-react";
import type { Product } from "../types/invoice.types";
import { ds } from "@/assets/designSystem";

const API_URL = import.meta.env.VITE_API_URL || "https://d16rb4jhhui7p6.cloudfront.net/api/v1";

function getToken(): string {
  return localStorage.getItem("_at") || localStorage.getItem("accessToken") || "";
}

interface InventoryProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  stock: number;
}

interface EditingRow {
  key: string;
  name: string;
  qty: string;
  price: string;
  productId?: string;   // vinculado al inventario
  stock?: number;       // stock disponible
}

interface OrderSummaryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onRemoveProduct: (id: string) => void;
  nota: string;
  onNotaChange: (val: string) => void;
}

const createEmptyRow = (): EditingRow => ({
  key: crypto.randomUUID(),
  name: "",
  qty: "",
  price: "",
  productId: undefined,
  stock: undefined,
});

const OrderSummary = ({ products, onAddProduct, onRemoveProduct, nota, onNotaChange }: OrderSummaryProps) => {
  const [editingRows, setEditingRows] = useState<EditingRow[]>([createEmptyRow()]);
  const lastRowRef = useRef<HTMLInputElement>(null);

  // Dropdown state per row
  const [suggestions, setSuggestions]       = useState<Record<string, InventoryProduct[]>>({});
  const [showDropdown, setShowDropdown]     = useState<Record<string, boolean>>({});
  const [searchLoading, setSearchLoading]   = useState<Record<string, boolean>>({});
  const searchTimers                        = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    lastRowRef.current?.focus();
  }, [editingRows.length]);

  const updateRow = (key: string, field: keyof Omit<EditingRow, "key">, value: string) => {
    setEditingRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  };

  // Buscar productos en inventario
  const searchProducts = useCallback(async (key: string, query: string) => {
    if (!query || query.length < 2) {
      setSuggestions(s => ({ ...s, [key]: [] }));
      setShowDropdown(d => ({ ...d, [key]: false }));
      return;
    }
    setSearchLoading(l => ({ ...l, [key]: true }));
    try {
      const res = await fetch(
        `${API_URL}/products?search=${encodeURIComponent(query)}&limit=8`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await res.json();
      console.log("RAW DATA:", JSON.stringify(data.data?.items?.[0]))
      const rawItems = data.data?.items || data.data?.data || [];
      const items: InventoryProduct[] = rawItems.map((p: any) => ({
        id:          p.id,
        code:        p.code,
        name:        p.name,
        description: p.description,
        price:       Number(p.price),
        unit:        p.unit,
        stock:       p.inventory
          ? p.inventory.reduce((s: number, i: any) => s + Number(i.stock_quantity), 0)
          : (p.stock ?? 0),
      }));
      setSuggestions(s => ({ ...s, [key]: items }));
      setShowDropdown(d => ({ ...d, [key]: items.length > 0 }));
    } catch {
      setSuggestions(s => ({ ...s, [key]: [] }));
    } finally {
      setSearchLoading(l => ({ ...l, [key]: false }));
    }
  }, []);

  const handleNameChange = (key: string, value: string) => {
    // Si el usuario edita manualmente, desvinculamos el productId
    setEditingRows(prev =>
      prev.map(r => r.key === key ? { ...r, name: value, productId: undefined, stock: undefined } : r)
    );
    // Debounce búsqueda
    clearTimeout(searchTimers.current[key]);
    searchTimers.current[key] = setTimeout(() => searchProducts(key, value), 300);
  };

  const selectProduct = (key: string, product: InventoryProduct) => {
    setEditingRows(prev =>
      prev.map(r => r.key === key ? {
        ...r,
        name:      product.name,
        price:     r.price || String(product.price),
        productId: product.id,
        stock:     product.stock,
      } : r)
    );
    setShowDropdown(d => ({ ...d, [key]: false }));
    setSuggestions(s => ({ ...s, [key]: [] }));
  };

  const saveRow = (key: string) => {
    const row = editingRows.find((r) => r.key === key);
    if (!row) return;
    const qty   = Number(row.qty);
    const price = Number(row.price);
    if (!row.name.trim() || qty < 1 || !row.price || price < 0) return;

    // Alerta si no hay stock suficiente
    if (row.productId && row.stock !== undefined && qty > row.stock) {
      // Permitimos continuar pero con advertencia — el backend validará
    }

    onAddProduct({
      name:      row.name.trim(),
      quantity:  qty,
      price,
      productId: row.productId,
    });

    setEditingRows((prev) => [
      ...prev.filter((r) => r.key !== key),
      createEmptyRow(),
    ]);
    setShowDropdown(d => ({ ...d, [key]: false }));
  };

  const discardRow = (key: string) => {
    setEditingRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length === 0 ? [createEmptyRow()] : next;
    });
    setShowDropdown(d => ({ ...d, [key]: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter") { e.preventDefault(); saveRow(key); }
    if (e.key === "Escape") setShowDropdown(d => ({ ...d, [key]: false }));
  };

  return (
    <div className={`${ds.radius.card} border border-border bg-card ${ds.spacing.card.padding} h-full flex flex-col ${ds.shadows.card}`}>
      <h2 className={`${ds.typography.sectionHeading} text-foreground ${ds.spacing.form.headingMargin}`}>
        Detalle de Productos y Servicios
      </h2>

      <div className={`grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 ${ds.typography.label} text-muted-foreground pb-3 border-b border-border`}>
        <span>Cant.</span>
        <span>Descripción</span>
        <span className="text-right">P. Unit.</span>
        <span className="text-right">Total</span>
        <span></span>
      </div>

      <div className="flex-1 min-h-0">
        <div className="divide-y divide-border">

          {/* Productos ya agregados */}
          {products.map((p) => (
            <div key={p.id} className="grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 items-center py-3">
              <span className={`${ds.typography.body} text-foreground`}>{p.quantity}</span>
              <div className="flex items-center gap-1.5 min-w-0">
                {p.productId && (
                  <Package size={11} className="text-primary/60 flex-shrink-0" title="Producto del inventario" />
                )}
                <span className={`${ds.typography.body} text-foreground truncate`}>{p.name}</span>
              </div>
              <span className={`${ds.typography.body} text-foreground text-right`}>${p.price.toFixed(2)}</span>
              <span className={`${ds.typography.body} font-medium text-foreground text-right`}>${(p.quantity * p.price).toFixed(2)}</span>
              <div className="flex justify-end">
                <button onClick={() => onRemoveProduct(p.id)}
                  className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 ${ds.transitions.default}`}
                  title="Eliminar">
                  <X className={ds.sizing.icon.sm} />
                </button>
              </div>
            </div>
          ))}

          {/* Filas de edición */}
          {editingRows.map((row, idx) => {
            const qty      = Number(row.qty)   || 0;
            const price    = Number(row.price) || 0;
            const rowTotal = qty * price;
            const isLast   = idx === editingRows.length - 1;
            const hasLowStock = row.productId && row.stock !== undefined && Number(row.qty) > row.stock;

            return (
              <div key={row.key} className="py-2 space-y-1">
                <div className="grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 items-center">
                  <Input
                    ref={isLast ? lastRowRef : undefined}
                    type="number" min="1" placeholder="0"
                    value={row.qty}
                    onChange={(e) => updateRow(row.key, "qty", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.key)}
                    className={`${ds.spacing.input.height} px-2 ${ds.typography.body} text-center border-border/70 focus-visible:ring-primary/30`}
                  />

                  {/* Campo nombre con dropdown */}
                  <div className="relative">
                    <div className="relative">
                      {row.productId && (
                        <Package size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none" />
                      )}
                      <Input
                        placeholder="Descripción del producto..."
                        value={row.name}
                        onChange={(e) => handleNameChange(row.key, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.key)}
                        onFocus={() => { if (suggestions[row.key]?.length > 0) setShowDropdown(d => ({ ...d, [row.key]: true })) }}
                        onBlur={() => setTimeout(() => setShowDropdown(d => ({ ...d, [row.key]: false })), 200)}
                        className={`${ds.spacing.input.height} ${ds.typography.body} border-border/70 focus-visible:ring-primary/30 ${row.productId ? 'pl-6 text-primary' : 'px-2'}`}
                      />
                      {searchLoading[row.key] && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
                      )}
                    </div>

                    {/* Dropdown sugerencias */}
                    {showDropdown[row.key] && suggestions[row.key]?.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-xl overflow-hidden">
                        {suggestions[row.key].map(prod => (
                          <button
                            key={prod.id}
                            onMouseDown={() => selectProduct(row.key, prod)}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary/5 transition-colors text-left gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <Package size={10} className="text-primary/60 flex-shrink-0" />
                                <span className="text-xs font-medium text-foreground truncate">{prod.name}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{prod.code}</span>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-xs font-semibold text-foreground">${prod.price.toFixed(2)}</div>
                              <div className={`text-[10px] ${prod.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                Stock: {prod.stock}
                              </div>
                            </div>
                          </button>
                        ))}
                        <div className="px-3 py-1.5 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground/60">↵ Enter para agregar · Esc para cerrar</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={row.price}
                    onChange={(e) => updateRow(row.key, "price", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.key)}
                    className={`${ds.spacing.input.height} px-2 ${ds.typography.body} text-right border-border/70 focus-visible:ring-primary/30`}
                  />
                  <span className={`${ds.typography.body} text-muted-foreground text-right pr-1`}>${rowTotal.toFixed(2)}</span>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => saveRow(row.key)}
                      className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-600 ${ds.transitions.default}`}
                      title="Guardar">
                      <Check className={ds.sizing.icon.sm} />
                    </button>
                    <button onClick={() => discardRow(row.key)}
                      className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 ${ds.transitions.default}`}
                      title="Eliminar">
                      <X className={ds.sizing.icon.sm} />
                    </button>
                  </div>
                </div>

                {/* Alerta stock bajo */}
                {hasLowStock && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 col-span-5">
                    <AlertCircle size={11} className="text-amber-500 flex-shrink-0" />
                    <span className="text-[10px] text-amber-600">
                      Stock disponible: {row.stock} unidades — estás ingresando {row.qty}
                    </span>
                  </div>
                )}

                {/* Indicador producto vinculado */}
                {row.productId && !hasLowStock && (
                  <div className="flex items-center gap-1 px-2">
                    <Package size={10} className="text-primary/50" />
                    <span className="text-[10px] text-primary/60">Producto del inventario — se descontará el stock al facturar</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <textarea
          value={nota}
          onChange={e => onNotaChange(e.target.value)}
          placeholder="Nota adicional (opcional)"
          rows={2}
          className="mt-3 w-full text-xs text-muted-foreground bg-transparent border border-border/30 rounded-lg focus:outline-none focus:border-border/60 resize-none placeholder:text-muted-foreground/40 px-3 py-2 transition-colors"
        />
      </div>
    </div>
  );
};

export default OrderSummary;
