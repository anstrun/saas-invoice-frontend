import { useState, useRef, useEffect } from "react";
import { Input } from "@/shared/components/ui/input";
import { Check, X } from "lucide-react";
import type { Product } from "../types/invoice.types";
import { ds } from "@/assets/designSystem";

interface EditingRow {
  key: string;
  name: string;
  qty: string;
  price: string;
}

interface OrderSummaryProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onRemoveProduct: (id: string) => void;
}

const createEmptyRow = (): EditingRow => ({
  key: crypto.randomUUID(),
  name: "",
  qty: "",
  price: "",
});

const OrderSummary = ({ products, onAddProduct, onRemoveProduct }: OrderSummaryProps) => {
  const [editingRows, setEditingRows] = useState<EditingRow[]>([createEmptyRow()]);
  const lastRowRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lastRowRef.current?.focus();
  }, [editingRows.length]);

  const updateRow = (key: string, field: keyof Omit<EditingRow, "key">, value: string) => {
    setEditingRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  };

  const saveRow = (key: string) => {
    const row = editingRows.find((r) => r.key === key);
    if (!row) return;

    const qty = Number(row.qty);
    const price = Number(row.price);
    if (!row.name.trim() || qty < 1 || !row.price || price < 0) return;

    onAddProduct({ name: row.name.trim(), quantity: qty, price });

    setEditingRows((prev) => [
      ...prev.filter((r) => r.key !== key),
      createEmptyRow(),
    ]);
  };

  const discardRow = (key: string) => {
    setEditingRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length === 0 ? [createEmptyRow()] : next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRow(key);
    }
  };

  return (
    <div className={`${ds.radius.card} border border-border bg-card ${ds.spacing.card.padding} h-full flex flex-col ${ds.shadows.card}`}>
      <h2 className={`${ds.typography.sectionHeading} text-foreground ${ds.spacing.form.headingMargin}`}>
        Detalle de Productos y Servicios
      </h2>

      <div className={`grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 ${ds.typography.label} text-muted-foreground pb-3 border-b border-border`}>
        <span>Cant.</span>
        <span>Descripcion</span>
        <span className="text-right">P. Unit.</span>
        <span className="text-right">Total</span>
        <span></span>
      </div>

      <div className="flex-1 min-h-0">
        <div className="divide-y divide-border">
          {products.map((p) => (
            <div
              key={p.id}
              className={`grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 items-center py-3`}
            >
              <span className={`${ds.typography.body} text-foreground`}>{p.quantity}</span>
              <span className={`${ds.typography.body} text-foreground truncate`}>{p.name}</span>
              <span className={`${ds.typography.body} text-foreground text-right`}>
                ${p.price.toFixed(2)}
              </span>
              <span className={`${ds.typography.body} font-medium text-foreground text-right`}>
                ${(p.quantity * p.price).toFixed(2)}
              </span>
              <div className="flex justify-end">
                <button
                  onClick={() => onRemoveProduct(p.id)}
                  className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 ${ds.transitions.default}`}
                  title="Eliminar"
                >
                  <X className={ds.sizing.icon.sm} />
                </button>
              </div>
            </div>
          ))}

          {editingRows.map((row, idx) => {
            const qty = Number(row.qty) || 0;
            const price = Number(row.price) || 0;
            const rowTotal = qty * price;
            const isLast = idx === editingRows.length - 1;

            return (
              <div
                key={row.key}
                className={`grid grid-cols-[56px_1fr_96px_96px_72px] gap-2 items-center py-2`}
              >
                <Input
                  ref={isLast ? lastRowRef : undefined}
                  type="number"
                  min="1"
                  placeholder="0"
                  value={row.qty}
                  onChange={(e) => updateRow(row.key, "qty", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row.key)}
                  className={`${ds.spacing.input.height} px-2 ${ds.typography.body} text-center border-border/70 focus-visible:ring-primary/30`}
                />
                <Input
                  placeholder="Descripcion del producto"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, "name", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row.key)}
                  className={`${ds.spacing.input.height} px-2 ${ds.typography.body} border-border/70 focus-visible:ring-primary/30`}
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={row.price}
                  onChange={(e) => updateRow(row.key, "price", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row.key)}
                  className={`${ds.spacing.input.height} px-2 ${ds.typography.body} text-right border-border/70 focus-visible:ring-primary/30`}
                />
                <span className={`${ds.typography.body} text-muted-foreground text-right pr-1`}>
                  ${rowTotal.toFixed(2)}
                </span>
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => saveRow(row.key)}
                    className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-green-50 text-green-500 hover:bg-green-100 hover:text-green-600 ${ds.transitions.default}`}
                    title="Guardar"
                  >
                    <Check className={ds.sizing.icon.sm} />
                  </button>
                  <button
                    onClick={() => discardRow(row.key)}
                    className={`flex ${ds.sizing.actionButton} items-center justify-center ${ds.radius.buttonSm} bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 ${ds.transitions.default}`}
                    title="Eliminar"
                  >
                    <X className={ds.sizing.icon.sm} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
