
import { UserRole, Item, Requisition, RequisitionStatus, Batch, User } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u-master-orsi',
    name: 'Manutenção Orsi',
    login: 'manutencao@orsi.com.br',
    role: UserRole.MASTER,
    active: true,
    settings: { theme: 'dark', expiringLotsAlertDays: 30, allowPartialFulfillment: true, requireReceiptConfirmation: true }
  },
  {
    id: 'u1',
    name: 'Admin Master',
    login: 'admin',
    role: UserRole.MASTER,
    active: true,
    settings: { theme: 'dark', expiringLotsAlertDays: 30, allowPartialFulfillment: true, requireReceiptConfirmation: true }
  },
  {
    id: 'u2',
    name: 'João Requisitante',
    login: 'joao',
    role: UserRole.REQUISITANTE,
    active: true,
    settings: { theme: 'light', expiringLotsAlertDays: 30, allowPartialFulfillment: false, requireReceiptConfirmation: true }
  }
];

export const MOCK_ITEMS: Item[] = [
  {
    id: 'i1',
    code: 'MAT-001',
    description: 'Papel A4 Sulfite 75g',
    unit: 'Resma',
    category: 'Escritório',
    minStock: 20,
    maxStock: 100,
    reorderPoint: 40,
    currentStock: 15, // Alerta: Abaixo do mínimo
    controlLot: true,
    controlExpiry: true,
    defaultAddress: 'A-01-01',
    active: true,
  },
  {
    id: 'i2',
    code: 'LIM-002',
    description: 'Detergente Neutro 500ml',
    unit: 'Frasco',
    category: 'Limpeza',
    minStock: 10,
    maxStock: 50,
    reorderPoint: 20,
    currentStock: 20, // Alerta: Ponto de pedido atingido
    controlLot: false,
    controlExpiry: false,
    defaultAddress: 'B-02-10',
    active: true,
  },
  {
    id: 'i3',
    code: 'MAT-003',
    description: 'Caneta Esferográfica Azul',
    unit: 'Unidade',
    category: 'Escritório',
    minStock: 50,
    maxStock: 500,
    reorderPoint: 100,
    currentStock: 450, // OK
    controlLot: false,
    controlExpiry: false,
    defaultAddress: 'A-01-05',
    active: true,
  }
];

export const MOCK_BATCHES: Batch[] = [
  { id: 'b1', itemId: 'i1', lotNumber: 'L2024-001', expiryDate: '2025-12-31', quantity: 15, cost: 25.50 },
  { id: 'b2', itemId: 'i1', lotNumber: 'L2024-002', expiryDate: '2024-05-15', quantity: 5, cost: 26.00 },
];

export const MOCK_REQUISITIONS: Requisition[] = [
  {
    id: 'r1',
    number: '001',
    year: 2024,
    sector: 'Financeiro',
    requesterId: 'u2',
    requesterName: 'João Requisitante',
    date: '2024-03-20',
    priority: 'MEDIA',
    status: RequisitionStatus.APROVADO,
    items: [
      { itemId: 'i1', description: 'Papel A4 Sulfite 75g', unit: 'Resma', requestedQty: 5, fulfilledQty: 0 },
      { itemId: 'i3', description: 'Caneta Esferográfica Azul', unit: 'Unidade', requestedQty: 10, fulfilledQty: 0 }
    ],
    timeline: [
      { status: RequisitionStatus.RASCUNHO, userId: 'u2', userName: 'João Requisitante', timestamp: '2024-03-20T10:00:00Z' },
      { status: RequisitionStatus.ENVIADO, userId: 'u2', userName: 'João Requisitante', timestamp: '2024-03-20T10:05:00Z' },
      { status: RequisitionStatus.APROVADO, userId: 'u1', userName: 'Admin Master', timestamp: '2024-03-20T11:00:00Z' },
    ]
  },
  {
    id: 'r2',
    number: '002',
    year: 2024,
    sector: 'T.I.',
    requesterId: 'u2',
    requesterName: 'João Requisitante',
    date: '2024-03-21',
    priority: 'ALTA',
    status: RequisitionStatus.RASCUNHO,
    items: [
      { itemId: 'i2', description: 'Detergente Neutro 500ml', unit: 'Frasco', requestedQty: 2, fulfilledQty: 0 }
    ],
    timeline: [
      { status: RequisitionStatus.RASCUNHO, userId: 'u2', userName: 'João Requisitante', timestamp: '2024-03-21T09:00:00Z' },
    ]
  }
];
