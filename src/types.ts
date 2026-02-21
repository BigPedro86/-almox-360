
export enum UserRole {
  MASTER = 'MASTER',
  REQUISITANTE = 'REQUISITANTE',
  APROVADOR = 'APROVADOR',
  ALMOXARIFE = 'ALMOXARIFE',
  AUDITOR = 'AUDITOR',
}

export type User = {
  id: string;
  name: string;
  login: string;
  role: UserRole;
  active: boolean;
  settings: UserSettings;
};

export type UserSettings = {
  theme: 'light' | 'dark';
  expiringLotsAlertDays: number;
  allowPartialFulfillment: boolean;
  requireReceiptConfirmation: boolean;
};

export type Item = {
  id: string;
  code: string;
  description: string;
  unit: string;
  category: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  currentStock: number; // Adicionado para controle de alertas
  controlLot: boolean;
  controlExpiry: boolean;
  defaultAddress: string;
  active: boolean;
  price: number;
};

export enum RequisitionStatus {
  RASCUNHO = 'RASCUNHO',
  ENVIADO = 'ENVIADO',
  APROVADO = 'APROVADO',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  ATENDIDO = 'ATENDIDO',
  ENTREGUE = 'ENTREGUE',
  REPROVADO = 'REPROVADO',
  DEVOLVIDO = 'DEVOLVIDO',
}

export type Requisition = {
  id: string;
  number: string;
  year: number;
  sector: string;
  requesterId: string;
  requesterName: string;
  date: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: RequisitionStatus;
  observations?: string;
  items: RequisitionItem[];
  timeline: TimelineEvent[];
};

export type RequisitionItem = {
  itemId: string;
  description: string;
  unit: string;
  requestedQty: number;
  fulfilledQty: number;
  returnedQty?: number;
};

export type TimelineEvent = {
  status: RequisitionStatus;
  userId: string;
  userName: string;
  timestamp: string;
  note?: string;
};

export type Batch = {
  id: string;
  itemId: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  cost?: number;
};

export type Receipt = {
  id: string;
  docNumber: string;
  supplier: string;
  date: string;
  items: ReceiptItem[];
  userId: string;
  userName: string;
  timestamp: string;
};

export type ReceiptItem = {
  itemId: string;
  quantity: number;
  unit: string;
  lot: string;
  expiry: string;
  unitCost?: number;
};

export type Inventory = {
  id: string;
  date: string;
  responsible: string;
  status: 'ABERTO' | 'CONCLUIDO' | 'AJUSTADO';
  observation?: string;
};

export type InventoryCount = {
  id: string;
  inventoryId: string;
  itemId: string;
  lotId?: string;
  systemQty: number;
  physicalQty: number;
  justification?: string;
};
