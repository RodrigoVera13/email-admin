export interface ManifiestoItem {
  MANIFIESTO: string;
  DES_NAVE: string;
  OMI: string;
  ETA: string;
  ATA: string;
  NROBLM: string;
  POL: string;
  POD: string;
  RUC_FFW: string;
  DES_FFW: string;
  ADUANA: string;
  ANIO: string;
  DES_AGENTE: string;
}

export interface CompanyGroup {
  id: string;
  ruc: string;
  nombre: string;
  cantidadManifiestos: number;
  manifiestos: ManifiestoItem[];
  isExpanded: boolean;
  email: string;
}