import { DollarSign } from "lucide-react";
import { ds } from "@/assets/designSystem";

const PaymentMethod = () => {
  return (
    <div className={`${ds.radius.card} border border-border bg-card ${ds.spacing.card.padding}`}>
      <h2 className={`${ds.typography.cardHeading} text-card-foreground ${ds.spacing.form.headingMargin}`}>Metodo de Pago</h2>
      <div className={`flex items-center ${ds.spacing.element.gapMd} p-4 ${ds.radius.interactive} border-2 border-primary bg-primary/5`}>
        <DollarSign className={`${ds.sizing.icon.xl} text-primary`} />
        <div>
          <p className={`${ds.typography.body} font-medium text-card-foreground`}>Efectivo</p>
          <p className={`${ds.typography.caption} text-muted-foreground`}>Pago contra entrega</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
