import React, { useState, useEffect } from 'react';
import { Settings, Bell, ShieldCheck, Monitor, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserSettings } from '../types';

const Configuracoes: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    expiringLotsAlertDays: 30,
    allowPartialFulfillment: false,
    requireReceiptConfirmation: true
  });

  useEffect(() => {
    if (user && user.settings) {
      setSettings(user.settings);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({ settings });
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Settings size={20} className="text-slate-500" />
          Configurações do Sistema
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Parâmetros Operacionais</h3>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Bell size={14} className="inline mr-1 mb-0.5 text-slate-400" />
              Antecedência para Alerta de Vencimento (Dias)
            </label>
            <input
              type="number"
              value={settings.expiringLotsAlertDays}
              onChange={(e) => handleChange('expiringLotsAlertDays', parseInt(e.target.value))}
              className="w-full max-w-xs p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium"
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.allowPartialFulfillment}
                onChange={(e) => handleChange('allowPartialFulfillment', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Permitir atendimento parcial de requisições</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.requireReceiptConfirmation}
                onChange={(e) => handleChange('requireReceiptConfirmation', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Exigir confirmação de recebimento pelo solicitante</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
