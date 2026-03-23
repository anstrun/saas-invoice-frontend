import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { CreditCard, User, Mail, Calendar } from "lucide-react";
import type { ClientData } from "../types/invoice.types";
import { ds } from "@/assets/designSystem";

interface ClientDataProps {
  data: ClientData;
  onChange: (data: ClientData) => void;
  isReadonly?: boolean;
  isSearching?: boolean;
  showSaveButton?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

const ClientDataPanel = ({ data, onChange, isReadonly, isSearching, showSaveButton, onSave, isSaving }: ClientDataProps) => {
  const update = (field: keyof ClientData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className={`${ds.radius.card} border border-border bg-card ${ds.spacing.card.padding} ${ds.shadows.card}`}>
      <div className={`flex items-center ${ds.spacing.element.gapMd} ${ds.spacing.form.headingMargin}`}>
        <User className={ds.sizing.icon.lg} style={{ color: ds.colors.brand }} />
        <h2 className={`${ds.typography.sectionHeading} text-foreground`}>Datos del Cliente</h2>
      </div>

      <div className={ds.spacing.form.fieldGap}>
        <div>
          <Label className={`${ds.typography.formLabel} text-primary`}>RUC del Cliente</Label>
          <div className={`relative ${ds.spacing.form.labelGap}`}>
            <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 ${ds.sizing.icon.md} text-muted-foreground/60`} />
            <Input
              placeholder="1234567890001"
              value={data.ruc}
              onChange={(e) => update("ruc", e.target.value)}
              className={`${ds.spacing.input.iconOffset} border-border/70 placeholder:text-primary/40 focus-visible:ring-primary/30 ${isReadonly ? 'bg-muted/50' : ''}`}
            />
          </div>
        </div>

        <div>
          <Label className={`${ds.typography.formLabel} text-primary`}>Razon Social</Label>
          <div className={`relative ${ds.spacing.form.labelGap}`}>
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${ds.sizing.icon.md} text-muted-foreground/60`} />
            <Input
              placeholder="Nombre del cliente"
              value={data.razonSocial}
              onChange={(e) => update("razonSocial", e.target.value)}
              disabled={isReadonly}
              className={`${ds.spacing.input.iconOffset} border-border/70 placeholder:text-primary/40 focus-visible:ring-primary/30 ${isReadonly ? 'bg-muted/50' : ''}`}
            />
          </div>
        </div>

        <div>
          <Label className={`${ds.typography.formLabel} text-primary`}>Correo Electronico</Label>
          <div className={`relative ${ds.spacing.form.labelGap}`}>
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${ds.sizing.icon.md} text-muted-foreground/60`} />
            <Input
              type="email"
              placeholder="cliente@ejemplo.com"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              disabled={isReadonly}
              className={`${ds.spacing.input.iconOffset} border-border/70 placeholder:text-primary/40 focus-visible:ring-primary/30 ${isReadonly ? 'bg-muted/50' : ''}`}
            />
          </div>
        </div>

        <div>
          <Label className={`${ds.typography.formLabel} text-primary`}>Fecha de Emision</Label>
          <div className={`relative ${ds.spacing.form.labelGap}`}>
            <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 ${ds.sizing.icon.md} text-muted-foreground/60`} />
            <Input
              type="date"
              value={data.fechaEmision}
              disabled
              className={`${ds.spacing.input.iconOffset} border-border/70 focus-visible:ring-primary/30 bg-muted/50`}
            />
          </div>
          {showSaveButton && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full mt-2 bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200"
            >
              {isSaving ? "Guardando..." : "Guardar Cliente"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDataPanel;
