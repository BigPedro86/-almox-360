import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Item, Requisition, UserRole } from '../types';

// Helper to handle Supabase responses
const handleResponse = async (query: any) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const apiClient = {
  auth: {
    login: async (credentials: any) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.login,
        password: credentials.password,
      });
      if (error) throw error;

      // Fetch profile to get role and name
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return {
          token: data.session?.access_token,
          user: { ...data.user, ...profile, login: data.user.email }
        };
      }
      return data;
    },
    register: async (data: any) => {
      // Create a temporary client to avoid logging out the current user
      const tempSupabase = createClient(
        (import.meta as any).env.VITE_SUPABASE_URL,
        (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      // 1. Create auth user
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: data.login,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role || 'REQUISITANTE'
          }
        }
      });
      if (authError) throw authError;
      return { success: true, user: authData.user };
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    },
    getMe: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return { ...user, ...profile, login: user.email };
    }
  },
  items: {
    getAll: async () => {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((item: any) => ({
        ...item,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        maxStock: item.max_stock,
        reorderPoint: item.reorder_point,
        defaultAddress: item.location,
        controlLot: item.control_lot,
        controlExpiry: item.control_expiry
      }));
    },
    create: async (item: any) => {
      const dbItem = {
        code: item.code,
        description: item.description,
        category: item.category,
        location: item.defaultAddress,
        min_stock: item.minStock,
        max_stock: item.maxStock,
        reorder_point: item.reorderPoint,
        current_stock: item.currentStock,
        unit: item.unit,
        control_lot: item.controlLot,
        control_expiry: item.controlExpiry,
        active: item.active !== false
      };
      const { data, error } = await supabase.from('items').insert(dbItem).select().single();
      if (error) throw new Error(error.message);
      return {
        ...data,
        currentStock: data.current_stock,
        minStock: data.min_stock,
        maxStock: data.max_stock,
        reorderPoint: data.reorder_point,
        defaultAddress: data.location,
        controlLot: data.control_lot,
        controlExpiry: data.control_expiry
      };
    },
    update: async (id: string, item: Partial<Item>) => {
      const dbItem: any = {};
      if (item.code !== undefined) dbItem.code = item.code;
      if (item.description !== undefined) dbItem.description = item.description;
      if (item.category !== undefined) dbItem.category = item.category;
      if (item.defaultAddress !== undefined) dbItem.location = item.defaultAddress;
      if (item.minStock !== undefined) dbItem.min_stock = item.minStock;
      if (item.maxStock !== undefined) dbItem.max_stock = item.maxStock;
      if (item.reorderPoint !== undefined) dbItem.reorder_point = item.reorderPoint;
      if (item.currentStock !== undefined) dbItem.current_stock = item.currentStock;
      if (item.unit !== undefined) dbItem.unit = item.unit;
      if (item.controlLot !== undefined) dbItem.control_lot = item.controlLot;
      if (item.controlExpiry !== undefined) dbItem.control_expiry = item.controlExpiry;
      if (item.active !== undefined) dbItem.active = item.active;

      const { data, error } = await supabase.from('items').update(dbItem).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return {
        ...data,
        currentStock: data.current_stock,
        minStock: data.min_stock,
        maxStock: data.max_stock,
        reorderPoint: data.reorder_point,
        defaultAddress: data.location,
        controlLot: data.control_lot,
        controlExpiry: data.control_expiry
      };
    },
    delete: async (id: string) => handleResponse(supabase.from('items').delete().eq('id', id)),
    getStockAlerts: async () => {
      const { data, error } = await supabase.from('items').select('*');
      if (error) return [];
      return data
        .map((item: any) => ({
          ...item,
          currentStock: item.current_stock,
          minStock: item.min_stock
        }))
        .filter((item: any) => (item.currentStock || 0) <= (item.minStock || 0));
    }
  },
  requisitions: {
    getAll: async () => {
      const { data, error } = await supabase.from('requisitions').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((r: any) => ({
        ...r,
        sector: r.department,
        requesterName: r.user_name,
        requesterId: r.user_id,
        // ensure items is parsed if it's a string, though supabase client usually returns JSON
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        priority: r.priority || 'MEDIA', // Fallback
        timeline: r.timeline || []
      }));
    },
    getById: async (id: string) => {
      const { data, error } = await supabase.from('requisitions').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return {
        ...data,
        sector: data.department,
        requesterName: data.user_name,
        requesterId: data.user_id,
        items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
        priority: data.priority || 'MEDIA',
        timeline: data.timeline || []
      };
    },
    create: async (data: any) => {
      // Ensure user_id is set
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const dbRequisition = {
        user_id: user.id,
        user_name: data.requesterName, // From frontend Requisition object
        department: data.sector,
        date: data.date,
        status: data.status,
        priority: data.priority,
        items: data.items,
        observations: data.observations,
        timeline: data.timeline
      };

      const { data: result, error } = await supabase.from('requisitions').insert(dbRequisition).select().single();
      if (error) throw new Error(error.message);

      return {
        ...result,
        sector: result.department,
        requesterName: result.user_name,
        requesterId: result.user_id,
        priority: result.priority,
        items: result.items,
        timeline: result.timeline
      };
    },
    submit: async (id: string) => handleResponse(supabase.from('requisitions').update({ status: 'ENVIADO' }).eq('id', id)),
    approve: async (id: string) => handleResponse(supabase.from('requisitions').update({ status: 'APROVADO' }).eq('id', id)),
    reject: async (id: string, data?: any) => handleResponse(supabase.from('requisitions').update({ status: 'REPROVADO', rejection_reason: data?.reason }).eq('id', id)),
    fulfill: async (id: string, data: { items: { itemId: string; qty: number }[] }) => {
      // 1. Get current requisition
      const { data: req, error: reqError } = await supabase.from('requisitions').select('*').eq('id', id).single();
      if (reqError) throw new Error(reqError.message);

      let currentItems = typeof req.items === 'string' ? JSON.parse(req.items) : req.items;

      // 2. Process fulfillment
      for (const fulfillItem of data.items) {
        // Update Stock (Decrease)
        const { data: itemData, error: itemError } = await supabase.from('items').select('id, current_stock').eq('id', fulfillItem.itemId).single();
        if (itemData) {
          const newStock = (itemData.current_stock || 0) - fulfillItem.qty;
          await supabase.from('items').update({
            current_stock: newStock
          }).eq('id', fulfillItem.itemId);
        }

        // Update Requisition Item
        const reqItemIndex = currentItems.findIndex((i: any) => i.itemId === fulfillItem.itemId);
        if (reqItemIndex !== -1) {
          currentItems[reqItemIndex].fulfilledQty = (currentItems[reqItemIndex].fulfilledQty || 0) + fulfillItem.qty;
        }
      }

      // 3. Determine Status
      const allFulfilled = currentItems.every((i: any) => (i.fulfilledQty || 0) >= i.requestedQty);
      const anyFulfilled = currentItems.some((i: any) => (i.fulfilledQty || 0) > 0);

      let newStatus = req.status;
      if (allFulfilled) {
        newStatus = 'ENTREGUE';
      } else if (anyFulfilled) {
        newStatus = 'EM_ATENDIMENTO'; // Or maintain current status if already EM_ATENDIMENTO
      }

      // Add timeline entry
      const { data: { user } } = await supabase.auth.getUser();
      const newTimeline = [
        ...(req.timeline || []),
        {
          status: 'ENTREGA',
          userId: user?.id,
          userName: 'Almoxarifado',
          timestamp: new Date().toISOString(),
          note: `Entrega de materiais realizada. Status: ${newStatus}`
        }
      ];

      return handleResponse(supabase.from('requisitions').update({
        items: currentItems,
        status: newStatus,
        timeline: newTimeline
      }).eq('id', id));
    },
    update: async (id: string, data: any) => handleResponse(supabase.from('requisitions').update(data).eq('id', id)),
    returnItems: async (id: string, data: { items: { itemId: string; qty: number }[]; notes: string }) => {
      // 1. Get current requisition
      const { data: req, error: reqError } = await supabase.from('requisitions').select('*').eq('id', id).single();
      if (reqError) throw new Error(reqError.message);

      let currentItems = typeof req.items === 'string' ? JSON.parse(req.items) : req.items;

      // 2. Process returns
      for (const returnItem of data.items) {
        // Update Stock
        const { data: itemData, error: itemError } = await supabase.from('items').select('current_stock').eq('id', returnItem.itemId).single();
        if (itemData) {
          await supabase.from('items').update({
            current_stock: (itemData.current_stock || 0) + returnItem.qty
          }).eq('id', returnItem.itemId);
        }

        // Update Requisition Item
        const reqItemIndex = currentItems.findIndex((i: any) => i.itemId === returnItem.itemId);
        if (reqItemIndex !== -1) {
          currentItems[reqItemIndex].returnedQty = (currentItems[reqItemIndex].returnedQty || 0) + returnItem.qty;
        }
      }

      // 3. Update Requisition
      // Check if all items are fully returned? For now just update items and add timeline
      // If we want to change status to DEVOLVIDO if everything is returned:
      // const allReturned = currentItems.every((i: any) => (i.returnedQty || 0) >= (i.fulfilledQty || i.requestedQty));

      const newTimeline = [
        ...(req.timeline || []),
        {
          status: 'DEVOLUCAO', // Custom status for timeline
          userId: (await supabase.auth.getUser()).data.user?.id,
          userName: 'Usuário', // Should get name properly but acceptable for now
          timestamp: new Date().toISOString(),
          note: `Devolução: ${data.notes}`
        }
      ];

      return handleResponse(supabase.from('requisitions').update({
        items: currentItems,
        timeline: newTimeline,
        // status: allReturned ? 'DEVOLVIDO' : req.status // Optional: change status if full return
      }).eq('id', id));
    }
  },
  receipts: {
    getAll: async () => {
      const { data, error } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((r: any) => ({
        ...r,
        itemSku: r.item_sku,
        originalSku: r.original_sku,
        totalValue: r.total_value,
        unitCost: r.unit_cost
      }));
    },
    create: async (data: any) => {
      // 1. Update Stock
      // Assuming itemSku corresponds to item code
      const { data: itemData, error: itemError } = await supabase.from('items').select('id, current_stock').eq('code', data.itemSku).single();

      if (itemData) {
        await supabase.from('items').update({
          current_stock: (itemData.current_stock || 0) + (Number(data.items) || 0)
        }).eq('id', itemData.id);
      } else {
        console.warn(`Item com código ${data.itemSku} não encontrado para atualização de estoque.`);
      }

      // 2. Create Receipt
      const dbReceipt = {
        doc: data.doc,
        supplier: data.supplier,
        date: data.date,
        items: data.items, // Quantity
        item_sku: data.itemSku,
        original_sku: data.originalSku,
        lot: data.lot,
        expiry: data.expiry,
        unit: data.unit,
        total_value: data.totalValue,
        unit_cost: data.unitCost,
        status: data.status || 'CONCLUÍDO'
      };
      return handleResponse(supabase.from('receipts').insert(dbReceipt).select().single());
    }
  },
  inventory: {
    getAll: async () => handleResponse(supabase.from('inventory_cycles').select('*').order('start_date', { ascending: false })),
    create: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      return handleResponse(supabase.from('inventory_cycles').insert({ ...data, created_by: user?.id }).select().single());
    },
    update: async (id: string, data: any) => handleResponse(supabase.from('inventory_cycles').update(data).eq('id', id))
  },
  users: {
    getAll: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      // Map email/login from auth if possible or just return profiles
      return data.map((p: any) => ({
        ...p,
        login: p.email || '' // Profiles might not have email, but UI expects 'login'
      }));
    },
    update: async (id: string, data: any) => {
      // Create a clean object with only columns that exist in public.profiles
      const profileUpdates: any = {};
      if (data.name !== undefined) profileUpdates.name = data.name;
      if (data.role !== undefined) profileUpdates.role = data.role;
      if (data.active !== undefined) profileUpdates.active = data.active;
      if (data.department !== undefined) profileUpdates.department = data.department;

      const { data: result, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return result;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return true;
    }
  }
};
