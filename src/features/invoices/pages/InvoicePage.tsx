import { useState, useCallback, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, Send, Wifi, Loader2 } from "lucide-react";
import ClientDataPanel from "../components/ClientData";
import CompanyInfo from "../components/CompanyInfo";
import OrderSummary from "../components/OrderSummary";
import { createInvoice } from "../services/invoice.service";
import { mapToInvoiceDto } from "../mappers/invoice.mapper";
import { processInvoiceResponse } from "../helpers/invoice.helpers";
import type { ClientData, Product } from "../types/invoice.types";
import { useCertificateStatus, CertificateUploadDialog } from "@/features/certificates";
import { useCurrentBranch } from "../hooks/useBranch";
import { useCustomerByIdNumber, useCreateCustomer } from "@/features/customers";
import { queryClient } from "@/app/providers";
import { ds } from "@/assets/designSystem";
import { useParentAuth } from "../../../hooks/useParentAuth";

const TAX_OPTIONS = [
  { label: 'IVA 0%',  value: 0  },
  { label: 'IVA 8%',  value: 8  },
  { label: 'IVA 12%', value: 12 },
  { label: 'IVA 15%', value: 15 },
]

const todayISO = () => {
  const now = new Date();
  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  ).toISOString().split("T")[0];
};

const INITIAL_CLIENT: ClientData = {
  ruc: "",
  razonSocial: "CONSUMIDOR FINAL",
  email: "",
  fechaEmision: todayISO(),
};

const InvoicePage = () => {
  const [clientData, setClientData] = useState<ClientData>(INITIAL_CLIENT);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{
    show: boolean;
    variant: "default" | "destructive";
    title: string;
    description: string;
  }>({ show: false, variant: "default", title: "", description: "" });

  const { data: certStatus, isLoading: isCertLoading } = useCertificateStatus();
  const _ = useParentAuth();
  const { data: branchData } = useCurrentBranch();
  const { data: customerData, isLoading: isSearching } = useCustomerByIdNumber(searchTerm || "");
  const createCustomer = useCreateCustomer();
  const showCertDialog = !isCertLoading && certStatus?.data?.hasActiveCertificate === false;

  const subtotal = Math.round(products.reduce((sum, p) => sum + p.quantity * p.price, 0) * 100) / 100;
  const iva      = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total    = Math.round((subtotal + iva) * 100) / 100;

  useEffect(() => {
    const ruc = clientData.ruc.trim();
    if (ruc.length === 10 || ruc.length === 13) {
      setCustomerId(null);  // ← limpiar antes de buscar
      const timer = setTimeout(() => setSearchTerm(ruc), 500);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm(null);
      setCustomerId(null);
      setIsNewCustomer(false);
      if (ruc.length === 0) {
        setClientData(prev => ({ ...prev, razonSocial: "-", email: "" }));
        // Volver a cargar consumidor final
        setTimeout(() => setSearchTerm("9999999999"), 100);
      }
    }
  }, [clientData.ruc]);

  useEffect(() => {
    if (!customerData?.success) {
      setIsNewCustomer(false);
      setCustomerId(null);
      return;
    }
    if (customerData.data?.success && customerData.data.data) {
      setClientData((prev) => ({
        ...prev,
        razonSocial: customerData.data.data.name,
        email: customerData.data.data.email,
      }));
      setCustomerId(customerData.data.data.id);
      setIsNewCustomer(false);
    } else if (searchTerm && searchTerm.length >= 10 && !isSearching) {
      setIsNewCustomer(true);
      setCustomerId(null);
    }
  }, [customerData, searchTerm, isSearching]);

  const handleSaveCustomer = async () => {
    if (!clientData.razonSocial || !clientData.email || !clientData.ruc) {
      toast.error("Completa todos los campos");
      return;
    }

    const idType = clientData.ruc.length === 13 ? "04" : "05";

    try {
      const result = await createCustomer.mutateAsync({
        identificationType: idType,
        identification: clientData.ruc,
        name: clientData.razonSocial,
        email: clientData.email,
      });

      if (result.success && result.data?.success && result.data.data) {
        toast.success("Cliente guardado exitosamente");
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        setCustomerId(result.data.data.id);
        setSearchTerm(null);
        setTimeout(() => {
          setSearchTerm(clientData.ruc);
        }, 100);
      }
    } catch {
      toast.error("Error al guardar el cliente");
    }
  };

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...product, id: crypto.randomUUID() }]);
    toast.success("Producto agregado", { duration: 800 })
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast("Producto eliminado");
  }, []);

  const emitInvoice = async () => {
    if (products.length === 0) return;

    setIsLoading(true);
    try {
      const dto = mapToInvoiceDto(clientData, products, taxRate, customerId || "");
      const result = await createInvoice(dto);
      const processed = processInvoiceResponse(result);

      if (processed.success) {
        setAlertInfo({
          show: true,
          variant: "default",
          title: "Factura autorizada",
          description: `Clave: ${processed.accessKey}`,
        });
        toast.success(processed.message);
        setProducts([]);
        setClientData({ ...INITIAL_CLIENT, fechaEmision: todayISO() });
      } else {
        const errorDescription = processed.details
          ? processed.details.join("\n")
          : processed.message;
        setAlertInfo({
          show: true,
          variant: "destructive",
          title: processed.message,
          description: errorDescription,
        });
        toast.error(processed.message);
      }
    } catch (error) {
      setAlertInfo({
        show: true,
        variant: "destructive",
        title: "Error de conexion",
        description: "No se pudo conectar con el servidor",
      });
      toast.error("Error de conexion con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCertLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className={`${ds.spacing.page.x} ${ds.spacing.page.y}`}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className={`flex-1 ${ds.spacing.page.x} ${ds.spacing.page.bottom}`}>
          <div className={ds.layouts.twoColumns}>
            <div className={ds.spacing.section.stack}>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`${ds.spacing.page.x} ${ds.spacing.page.y}`}>
        <div className="flex items-center justify-between">
          <h1 className={`${ds.typography.pageTitle} text-foreground`}>Facturacion</h1>
          <div className={`flex items-center ${ds.spacing.element.gap} ${ds.radius.badge} border border-green-200 bg-green-50 px-4 py-1.5 ${ds.typography.body} font-medium text-green-600`}>
            <Wifi className={ds.sizing.icon.md} />
            SRI Conectado
          </div>
        </div>
      </div>

      <div className={`flex-1 ${ds.spacing.page.x} ${ds.spacing.page.bottom}`}>
        {alertInfo.show && (
          <Alert variant={alertInfo.variant} className={`${ds.spacing.form.headingMargin}`}>
            {alertInfo.variant === "default" ? (
              <CheckCircle className={ds.sizing.icon.md} />
            ) : (
              <AlertCircle className={ds.sizing.icon.md} />
            )}
            <AlertTitle>{alertInfo.title}</AlertTitle>
            <AlertDescription>{alertInfo.description}</AlertDescription>
          </Alert>
        )}

        <div className={ds.layouts.twoColumns}>
          <div className={ds.spacing.section.stack}>
            <CompanyInfo
              name={branchData?.data?.branch?.name || ""}
              ruc={branchData?.data?.branch?.ruc || ""}
              establishment={branchData?.data?.branch?.establishment || ""}
              emissionPoint={branchData?.data?.branch?.emissionPoint || ""}
              sequential={branchData?.data?.branch?.sequential || ""}
            />
            <ClientDataPanel
              data={clientData}
              onChange={(data) => setClientData({ ...clientData, ...data })}
              isReadonly={!isNewCustomer}
              showSaveButton={isNewCustomer}
              onSave={handleSaveCustomer}
              isSaving={createCustomer.isPending}
              isSearching={isSearching}
            />
            <div className={`${ds.radius.interactive} bg-amber-50 border border-amber-100 px-4 py-3`}>
              <p className={`${ds.typography.body} text-amber-700`}>
                <span className="mr-1.5">&#x1F4A1;</span>
                {clientData.ruc.length === 0
                  ? "Facturando a Consumidor Final — ingresa RUC o cédula para identificar al cliente"
                  : clientData.ruc.length !== 10 && clientData.ruc.length !== 13
                  ? `Identificación inválida — debe tener 10 (cédula) o 13 dígitos (RUC), tienes ${clientData.ruc.length}`
                  : isSearching
                  ? "Buscando cliente..."
                  : isNewCustomer
                  ? "Cliente no encontrado. Completa los datos y guarda."
                  : "Cliente encontrado ✓"}
              </p>
            </div>
          </div>

          <div>
            <OrderSummary
              products={products}
              onAddProduct={addProduct}
              onRemoveProduct={removeProduct}
            />
          </div>
        </div>
      </div>

      <div className={`fixed bottom-0 left-16 right-0 z-30 bg-card border-t border-border ${ds.shadows.stickyBar}`}>
        <div className={`${ds.spacing.page.x} py-4 flex items-center justify-between ${ds.spacing.section.gap}`}>
          <div className={`flex items-center ${ds.spacing.element.gapLg}`}>
            <div className={`flex items-center ${ds.spacing.element.gap}`}>
              <span className={`${ds.typography.body} text-muted-foreground`}>Subtotal</span>
              <span className={`${ds.typography.sectionHeading} text-foreground`}>
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className={`flex items-center ${ds.spacing.element.gap}`}>
              <select
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
                className="text-xs text-muted-foreground bg-transparent border border-border rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {TAX_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <span className={`${ds.typography.sectionHeading} text-foreground`}>
                ${iva.toFixed(2)}
              </span>
            </div>
           </div>
          <div className={`flex items-center ${ds.spacing.section.gap}`}>
            <div className={`flex items-center ${ds.spacing.element.gap}`}>
              <span className={`${ds.typography.body} text-muted-foreground`}>Total</span>
              <span className={`${ds.typography.price} text-primary`}>
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={emitInvoice}
              disabled={products.length === 0 || isLoading}
              size="lg"
              className={`px-8 ${ds.radius.button}`}
            >
              <Send className={`mr-2 ${ds.sizing.icon.md}`} />
              {isLoading ? "Procesando..." : "Emitir Factura"}
            </Button>
          </div>
        </div>
      </div>

      <CertificateUploadDialog
        open={showCertDialog}
        onUploadSuccess={() => {}}
      />
    </div>
  );
};

export default InvoicePage;
