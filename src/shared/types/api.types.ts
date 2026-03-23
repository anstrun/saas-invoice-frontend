export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
}

export type IdType = "04" | "05" | "06" | "07" | "08";

export type DocumentType = "01" | "03" | "04" | "05" | "06" | "07";

export type PaymentMethodCode =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21";

export type TaxCode = "2" | "3" | "5";

export type IvaRateCode = "0" | "2" | "3" | "6" | "7" | "8";

export type DeliveryStatus = "SIN_ENVIAR" | "ENVIADO" | "REENVIADO";

export type CustomerStatus = "ACTIVE" | "INACTIVE";

export type UserRole = "ADMIN" | "SELLER";

export type SRIStatus = "PENDIENTE" | "RECIBIDA" | "AUTORIZADO" | "RECHAZADO";
