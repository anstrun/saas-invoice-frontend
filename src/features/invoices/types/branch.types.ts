export interface Branch {
  id: string;
  name: string;
  ruc: string;
  establishment: string;
  emissionPoint: string;
  sequential: string;
  address: string;
  phone: string;
  email: string;
  environment: "PRUEBAS" | "PRODUCCION";
  emissionType: "NORMAL" | "OFFLINE";
}

export interface BranchResponse {
  success: boolean;
  data: {
    success: boolean;
    branch: Branch;
  };
}
