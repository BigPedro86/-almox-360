
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Requisitions from './pages/Requisitions';
import Atendimento from './pages/Atendimento';
import Entradas from './pages/Entradas';
import Inventario from './pages/Inventario';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

      {/* Alias/Redirects */}
      <Route path="/painel" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route path="/*" element={user ? (
        <Layout>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="itens" element={<Items />} />
            <Route path="entradas" element={<Entradas />} />
            <Route path="requisicoes" element={<Requisitions />} />
            <Route path="atendimento" element={<Atendimento />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="configuracoes" element={<Configuracoes />} />

            {/* Fallback internal */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Layout>
      ) : <Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
};

export default App;
