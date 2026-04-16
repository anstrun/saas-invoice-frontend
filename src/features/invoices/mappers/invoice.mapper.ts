import type { ClientData, Product } from "../types/invoice.types";
import type { FacturaRequest, InvoiceInfo, Detail, Payment, TaxDetail } from "../types/invoice.types";

const IVA_CODE = "2";

export function mapToInvoiceDto(
  clientData: ClientData,
  products: Product[],
  taxRate: number,
  customerId: string
): FacturaRequest {
const subtotal = Math.round(products.reduce((sum, p) => sum + p.quantity * p.price, 0) * 100) / 100;
const iva      = Math.round(subtotal * (taxRate / 100) * 100) / 100;
const total    = Math.round((subtotal + iva) * 100) / 100;
  const tipoIdentificacion = mapTipoIdentificacion(clientData.ruc);

  const infoFactura: InvoiceInfo = {
    tipoIdentificacionComprador: tipoIdentificacion,
    razonSocialComprador: clientData.razonSocial || "CONSUMIDOR FINAL",
    identificacionComprador: clientData.ruc || "9999999999999",
    totalSinImpuestos: subtotal,
    totalDescuento: 0,
    importeTotal: total,
    moneda: "USD",
    pagos: [{
      medio: "01",
      total: total,
      plazo: "0",
      unidadTiempo: "dias",
    }],
  };

  const detalles: Detail[] = products.map((p): Detail => {
    const lineTotal = Math.round(p.quantity * p.price * 100) / 100;
    const lineTax   = Math.round(lineTotal * (taxRate / 100) * 100) / 100;

    return {
      codigoPrincipal: crypto.randomUUID().slice(0, 8).toUpperCase(),
      descripcion: p.name,
      cantidad: p.quantity,
      precioUnitario: p.price,
      descuento: 0,
      impuestos: [{
        codigo: IVA_CODE,
        codigoPorcentaje: mapTaxRateToCodigoPorcentaje(taxRate),
        tarifa: taxRate.toString(),
        baseImponible: lineTotal,
        valor: lineTax,
      }],
    };
  });

  return { customerId, infoFactura, detalles };
}

function mapTipoIdentificacion(identificacion: string): "04" | "05" | "07" {
  if (!identificacion || identificacion === "9999999999999") return "07";
  if (identificacion.length === 13) return "04";
  return "05";
}

function mapTaxRateToCodigoPorcentaje(rate: number): string {
  const map: Record<number, string> = {
    0: "0",
    8: "2",
    12: "2",
    14: "3",
    15: "4",
  };
  return map[rate] || "2";
}
