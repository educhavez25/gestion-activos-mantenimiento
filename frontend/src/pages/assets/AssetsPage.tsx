import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Laptop,
  CheckCircle2,
  X,
} from 'lucide-react';
import { assetsApi } from '../../api/assetsApi';
import { catalogApi } from '../../api/catalogApi';
import { Asset, AssetFormData, AssetStatus } from '../../types/asset';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Loader } from '../../components/ui/Loader';

export const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isSupervisor, isAdmin } = useAuth();

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [page, setPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<AssetFormData>({
    code: '',
    name: '',
    description: '',
    category_id: '',
    location_id: '',
    assigned_to: '',
    status: 'available',
    purchase_date: '',
    warranty_expiration: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Queries
  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', { search, status, categoryId, locationId, page }],
    queryFn: () =>
      assetsApi.getAssets({
        search: search || undefined,
        status: status || undefined,
        category_id: categoryId || undefined,
        location_id: locationId || undefined,
        page,
        per_page: 10,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => catalogApi.getLocations(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => catalogApi.getUsers(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AssetFormData) => assetsApi.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetFormData }) =>
      assetsApi.updateAsset(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeleteConfirmId(null);
    },
  });

  const handleOpenCreateModal = () => {
    setEditingAsset(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
      location_id: locations[0]?.id || '',
      assigned_to: '',
      status: 'available',
      purchase_date: '',
      warranty_expiration: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      code: asset.code,
      name: asset.name,
      description: asset.description || '',
      category_id: asset.category?.id || '',
      location_id: asset.location?.id || '',
      assigned_to: asset.assignee?.id || '',
      status: asset.status,
      purchase_date: asset.purchase_date || '',
      warranty_expiration: asset.warranty_expiration || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload: AssetFormData = {
      ...formData,
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      category_id: Number(formData.category_id),
      location_id: Number(formData.location_id),
    };

    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getStatusBadge = (assetStatus: AssetStatus) => {
    switch (assetStatus) {
      case 'available':
        return <Badge variant="success">Disponible</Badge>;
      case 'assigned':
        return <Badge variant="info">Asignado</Badge>;
      case 'in_maintenance':
        return <Badge variant="warning">En Mantenimiento</Badge>;
      case 'retired':
        return <Badge variant="default">Dado de Baja</Badge>;
      default:
        return <Badge variant="default">{assetStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Activos Tecnológicos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Registro, inventario y control de estado de equipos de la empresa.
          </p>
        </div>
        {isSupervisor() && (
          <Button onClick={handleOpenCreateModal} className="shrink-0">
            <Plus className="w-4 h-4" />
            <span>Registrar Activo</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por código o nombre..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todos los Estados</option>
              <option value="available">Disponible</option>
              <option value="assigned">Asignado</option>
              <option value="in_maintenance">En Mantenimiento</option>
              <option value="retired">Dado de Baja</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todas las Sedes / Ubicaciones</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Código</th>
                <th className="px-6 py-3.5">Activo / Equipo</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">Ubicación</th>
                <th className="px-6 py-3.5">Responsable</th>
                <th className="px-6 py-3.5">Estado</th>
                {isSupervisor() && <th className="px-6 py-3.5 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : assetsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron activos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                assetsData?.data.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{asset.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>
                        <p>{asset.name}</p>
                        {asset.description && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{asset.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{asset.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">{asset.location?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {asset.assignee ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                            {asset.assignee.name.charAt(0)}
                          </div>
                          <span>{asset.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    {isSupervisor() && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(asset)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                            title="Editar Activo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => setDeleteConfirmId(asset.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Dar de baja / Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {assetsData?.meta && (
          <Pagination meta={assetsData.meta} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </Card>

      {/* Create / Edit Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAsset ? 'Editar Activo Tecnológico' : 'Registrar Nuevo Activo'}
        description="Completa la información del equipo y asigna su responsable."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Código del Activo"
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="LAP-001"
              error={formErrors.code?.[0]}
              required
            />

            <Input
              label="Nombre del Equipo"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ThinkPad T14 Gen 4"
              error={formErrors.name?.[0]}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción / Especificaciones
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Core i7 13th Gen, 32GB RAM, 1TB SSD..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Categoría"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Seleccionar categoría"
              error={formErrors.category_id?.[0]}
              required
            />

            <Select
              label="Ubicación / Sede"
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
              placeholder="Seleccionar ubicación"
              error={formErrors.location_id?.[0]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Responsable Asignado"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))}
              placeholder="Sin asignar (Disponible)"
            />

            {editingAsset ? (
              <Select
                label="Estado del Activo"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                options={[
                  { value: 'available', label: 'Disponible' },
                  { value: 'assigned', label: 'Asignado' },
                  { value: 'in_maintenance', label: 'En Mantenimiento' },
                  { value: 'retired', label: 'Dado de Baja' },
                ]}
                required
              />
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fecha de Compra"
              type="date"
              value={formData.purchase_date || ''}
              onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              error={formErrors.purchase_date?.[0]}
            />

            <Input
              label="Vencimiento de Garantía"
              type="date"
              value={formData.warranty_expiration || ''}
              onChange={(e) => setFormData({ ...formData, warranty_expiration: e.target.value })}
              error={formErrors.warranty_expiration?.[0]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingAsset ? 'Guardar Cambios' : 'Crear Activo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirmar Eliminación de Activo"
        description="Esta acción marcará el activo como eliminado mediante Soft Delete."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            ¿Estás seguro de que deseas eliminar este activo del inventario?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
            >
              Confirmar Eliminación
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
