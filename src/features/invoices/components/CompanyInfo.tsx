import { Building2 } from "lucide-react";
import { ds } from "@/assets/designSystem";

interface CompanyInfoProps {
  name: string;
  ruc: string;
  establishment: string;
  emissionPoint: string;
  sequential: string;
}

const CompanyInfo = ({ name, ruc, establishment, emissionPoint, sequential }: CompanyInfoProps) => {
  const establishmentCode = `${establishment}-${emissionPoint}-${sequential}`;

  return (
    <div className={`${ds.radius.card} border border-border bg-card ${ds.spacing.card.paddingCompact} ${ds.shadows.card}`}>
      <div className={`flex items-center ${ds.spacing.element.gapLg}`}>
        <div className={`flex ${ds.sizing.avatar.md} items-center justify-center ${ds.radius.badge} bg-primary/10 text-primary`}>
          <Building2 className={ds.sizing.icon.xl} />
        </div>
        <div>
          <h2 className={`${ds.typography.sectionHeading} text-foreground`}>{name}</h2>
          <p className={`${ds.typography.body} text-muted-foreground`}>
            RUC: {ruc}  &middot;  {establishmentCode}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
