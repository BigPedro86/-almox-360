
import React, { useState } from 'react';
import { Package, Lock, User, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [loginInput, setLoginInput] = useState(''); // rename local state to avoid conflict with login function
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegisterMode) {
        await apiClient.auth.register({ name, login: loginInput, password });
        setSuccess('Usuário cadastrado com sucesso! Faça login.');
        setIsRegisterMode(false);
      } else {
        const user = await login({ login: loginInput, password });
        if (user && user.settings?.theme) {
          setTheme(user.settings.theme);
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Falha na operação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl text-white shadow-xl mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Almox 360°</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Controle e Gestão de Estoque</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterMode && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="Seu login"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}
            {success && <p className="text-xs font-bold text-green-500 text-center">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegisterMode ? 'Cadastrar' : 'Entrar')}
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="w-full text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              {isRegisterMode ? 'Voltar para login' : 'Solicitar acesso'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
