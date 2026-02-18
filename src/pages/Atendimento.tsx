import React, { useState } from 'react';
import { useRequisitions } from '../hooks/useRequisitions';
import { useItems } from '../hooks/useItems';
import { RequisitionStatus, Requisition, Batch } from '../types';
import PickingList from '../components/Atendimento/PickingList';
import PickingDetail from '../components/Atendimento/PickingDetail';
import SuccessView from '../components/Atendimento/SuccessView';
import { useAuth } from '../contexts/AuthContext';

const Atendimento: React.FC = () => {
  const { user } = useAuth();
  const { requisitions, updateStatus } = useRequisitions();
  const { items: allItems } = useItems();

  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const aprovadas = requisitions.filter(r => r.status === RequisitionStatus.APROVADO);

  // Construct real batches from current stock
  const getRealBatches = (req: Requisition | null): Batch[] => {
    if (!req) return [];

    // We create a "virtual" batch for each item based on its total current stock
    return req.items.flatMap(reqItem => {
      // Match by ID, and if not found, try to match by exact name description
      // Ideally we should rely on IDs. requisition items usually have itemId being the UUID.
      const product = allItems.find(i => i.id === reqItem.itemId);

      if (!product) return [];

      return [{
        id: `stock-${product.id}`,
        itemId: product.id,
        lotNumber: 'ESTOQUE ATUAL',
        expiryDate: '-',
        quantity: product.currentStock || 0
      }];
    });
  };

  const handleConfirmDelivery = async () => {
    if (!selectedReq) return;
    setIsProcessing(true);
    try {
      const payload = {
        userId: user?.id,
        userName: user?.name,
        timestamp: new Date().toISOString(),
        items: selectedReq.items.map((i: any) => ({
          itemId: i.itemId,
          qty: i.requestedQty,
        }))
      };

      await updateStatus(selectedReq.id, 'fulfill', payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedReq(null);
      }, 2500);
    } catch (err) {
      alert("Erro ao confirmar entrega");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return <SuccessView />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!selectedReq ? (
        <PickingList
          requisitions={aprovadas}
          onSelect={setSelectedReq}
        />
      ) : (
        <PickingDetail
          requisition={selectedReq}
          batches={getRealBatches(selectedReq)}
          onBack={() => setSelectedReq(null)}
          onConfirm={handleConfirmDelivery}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default Atendimento;
