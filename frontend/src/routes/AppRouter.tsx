import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestLayout } from '../layouts/GuestLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { AssetsPage } from '../pages/assets/AssetsPage';
import { IncidentsPage } from '../pages/incidents/IncidentsPage';
import { MaintenancesPage } from '../pages/maintenances/MaintenancesPage';
import { CatalogsPage } from '../pages/catalogs/CatalogsPage';
import { UsersPage } from '../pages/users/UsersPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes (Login / Register) */}
        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Authenticated Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/maintenances" element={<MaintenancesPage />} />
          <Route path="/catalogs" element={<CatalogsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
