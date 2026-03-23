import type { DeliveryStatus, SRIStatus } from "@/shared/types/api.types";

export interface ClientData {
  ruc: string;
  razonSocial: string;
  email: string;
  fechaEmision: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type TaxDetail = {
  codigo: string;
  codigoPorcentaje: string;
  tarifa?: string;
  baseImponible: number;
  valor: number;
};

export type Detail = {
  codigoPrincipal: string;
  codigoAuxiliar?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  impuestos: TaxDetail[];
  detallesAdicionales?: Record<string, string>;
};

export type Payment = {
  medio: string;
  total: number;
  plazo?: string;
  unidadTiempo?: string;
};

export type InvoiceInfo = {
  tipoIdentificacionComprador: string;
  razonSocialComprador: string;
  identificacionComprador: string;
  direccionComprador?: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  importeTotal: number;
  moneda?: string;
  pagos: Payment[];
  infoAdicional?: Record<string, string>;
};

export type FacturaRequest = {
  customerId: string;
  infoFactura: InvoiceInfo;
  detalles: Detail[];
};

export type FacturaResponse = {
  success: boolean;
  data: {
    success: boolean;
    accessKey?: string;
    sriStatus?: string;
    error?: string;
    messages?: {
      identificador: string;
      mensaje: string;
      informacionAdicional?: string;
    }[];
  };
  timestamp?: string;
};

export type SRIReceptionResponse = {
  comprobante?: string;
  mensajes?: SRIMessages;
};

export type SRIMessages = {
  mensaje: SRIMessage | SRIMessage[];
};

export type SRIAuthorizationResponse = {
  estado: "AUTORIZADO" | "RECHAZADO" | string;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  raw?: unknown;
};

export type Invoice = {
  id: string;
  branchId: string;
  configId: string;
  customerId: string;
  accessKey: string;
  environment: string;
  emissionType: string;
  documentType: string;
  establishment: string;
  emissionPoint: string;
  sequential: string;
  issueDate: string;
  buyerIdType: string;
  buyerId: string;
  buyerName: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  authorizationNumber: string;
  sriStatus: SRIStatus;
  xmlS3Url: string;
  pdfS3Url: string;
  deliveryStatus: DeliveryStatus;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceResponse = {
  success: boolean;
  invoice: Invoice;
};

export type InvoiceListResponse = {
  success: boolean;
  invoices: Invoice[];
};

export type SRIMessage = {
  identificador?: string;
  mensaje?: string;
  tipo: "ERROR" | "ADVERTENCIA" | "INFORMATIVO" | string;
  informacionAdicional?: string;
};

export interface InvoiceResult {
  success: boolean;
  accessKey?: string;
  message: string;
  details?: string[];
}
