export interface Certificate {
  id: string;
  fileName: string;
  thumbprint: string;
  subjectCn: string;
  validFrom: string;
  validUntil: string;
  status: "VALID" | "EXPIRED" | string;
}

export interface CertificateStatus {
  id: string;
  subjectCn: string;
  validUntil: string;
  daysUntilExpiry: number;
}

export interface CertificateResponse {
  success: boolean;
  data: {
    success: boolean;
    certificate: Certificate;
  };
}

export interface CertificateStatusResponse {
  success: boolean;
  data: {
    success: boolean;
    hasActiveCertificate: boolean;
    certificate: CertificateStatus | null;
  };
}

export interface CertificateListResponse {
  success: boolean;
  data: {
    success: boolean;
    certificates: Certificate[];
  };
}
