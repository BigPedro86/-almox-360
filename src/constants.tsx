
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ClipboardList, 
  Truck, 
  BarChart3, 
  Settings, 
  Users, 
  History,
} from 'lucide-react';

export const MENU_ITEMS = [
  { path: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={2.5} />, roles: ['MASTER', 'REQUISITANTE', 'APROVADOR', 'ALMOXARIFE', 'AUDITOR'] },
  { path: 'itens', label: 'Estoque de Itens', icon: <Package size={20} strokeWidth={2.5} />, roles: ['MASTER', 'REQUISITANTE', 'APROVADOR', 'ALMOXARIFE', 'AUDITOR'] },
  { path: 'requisicoes', label: 'Requisições', icon: <ClipboardList size={20} strokeWidth={2.5} />, roles: ['MASTER', 'REQUISITANTE', 'APROVADOR', 'ALMOXARIFE'] },
  { path: 'atendimento', label: 'Atendimento', icon: <Truck size={20} strokeWidth={2.5} />, roles: ['MASTER', 'ALMOXARIFE'] },
  { path: 'entradas', label: 'Entradas (NF)', icon: <ArrowDownCircle size={20} strokeWidth={2.5} />, roles: ['MASTER', 'ALMOXARIFE'] },
  { path: 'inventario', label: 'Inventário', icon: <History size={20} strokeWidth={2.5} />, roles: ['MASTER', 'ALMOXARIFE', 'AUDITOR'] },
  { path: 'relatorios', label: 'Relatórios', icon: <BarChart3 size={20} strokeWidth={2.5} />, roles: ['MASTER', 'AUDITOR'] },
  { path: 'usuarios', label: 'Administração', icon: <Users size={20} strokeWidth={2.5} />, roles: ['MASTER'] },
  { path: 'configuracoes', label: 'Configurações', icon: <Settings size={20} strokeWidth={2.5} />, roles: ['MASTER', 'REQUISITANTE', 'APROVADOR', 'ALMOXARIFE', 'AUDITOR'] },
];

export const PRIORITY_COLORS = {
  BAIXA: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  MEDIA: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ALTA: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  URGENTE: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
};

export const STATUS_COLORS = {
  RASCUNHO: 'bg-slate-500/10 text-slate-500',
  ENVIADO: 'bg-indigo-500/10 text-indigo-500',
  APROVADO: 'bg-cyan-500/10 text-cyan-500',
  EM_ATENDIMENTO: 'bg-yellow-500/10 text-yellow-500',
  ATENDIDO: 'bg-blue-500/10 text-blue-500',
  ENTREGUE: 'bg-emerald-500/10 text-emerald-500 font-bold',
  REPROVADO: 'bg-rose-500/10 text-rose-500',
  DEVOLVIDO: 'bg-fuchsia-500/10 text-fuchsia-500',
};
