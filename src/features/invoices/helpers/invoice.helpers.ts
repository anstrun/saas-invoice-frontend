import type { FacturaResponse, InvoiceResult } from "../types/invoice.types";

export function processInvoiceResponse(response: FacturaResponse): InvoiceResult {
  if (!response.success) {
    console.log('Invoice response error:', response);
    return {
      success: false,
      message: response.data?.error || "Error desconocido",
    };
  }

  if (response.data) {
    console.log('Invoice SRI Messages:', response.data.messages);

    if (response.data.sriStatus === "RECHAZADA") {
      return {
        success: false,
        accessKey: response.data.accessKey,
        message: response.data.error || "Factura rechazada",
        details: response.data.messages?.map(m => 
          `${m.mensaje}${m.informacionAdicional ? ': ' + m.informacionAdicional : ''}`
        ),
      };
    }

    if (response.data.sriStatus === "AUTORIZADO") {
      return {
        success: true,
        accessKey: response.data.accessKey,
        message: response.data.error || "Factura autorizada exitosamente",
      };
    }
  }

  return {
    success: false,
    message: "Respuesta inválida del servidor",
  };
}
