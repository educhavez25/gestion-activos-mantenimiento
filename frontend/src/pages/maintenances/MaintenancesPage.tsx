import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Wrench,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { maintenancesApi } from '../../api/maintenancesApi';
import { assetsApi } from '../../api/assetsApi';
import { catalogApi } from '../../api/catalogApi';
import {
  MaintenanceRecord,
  MaintenanceFormData,
  MaintenanceStatus,
  MaintenanceType,
} from '../../types/maintenance';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Loader } from '../../components/ui/Loader';

export const MaintenancesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, isSupervisor } = useAuth();

  // Filters State
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedForComplete, setSelectedForComplete] = useState<MaintenanceRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState<MaintenanceFormData>({
    asset_id: '',
    type: 'preventive',
    status: 'scheduled',
    scheduled_date: '',
    performed_by: '',
    description: '',
    cost: '',
  });

  const [completeForm, setCompleteForm] = useState<{
    status: MaintenanceStatus;
    completed_date: string;
    cost: string | number;
    description: string;
  }>({
    status: 'completed',
    completed_date: new Date().toISOString().split('T')[0],
    cost: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Queries
  const { data: maintenancesData, isLoading } = useQuery({
    queryKey: ['maintenances', { type, status, page }],
    queryFn: () =>
      maintenancesApi.getMaintenances({
        type: type || undefined,
        status: status || undefined,
        page,
        per_page: 10,
      }),
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['assets-list-all'],
    queryFn: async () => {
      const res = await assetsApi.getAssets({ per_page: 100 });
      return res.data;
    },
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
    queryFn: () => catalogApi.getUsers('tecnico'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: MaintenanceFormData) => maintenancesApi.createMaintenance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsCreateModalOpen(false);
      setFormData({
        asset_id: '',
        type: 'preventive',
        status: 'scheduled',
        scheduled_date: '',
        performed_by: '',
        description: '',
        cost: '',
      });
      setErrors({});
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MaintenanceFormData> }) =>
      maintenancesApi.updateMaintenance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenances'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedForComplete(null);
      setErrors({});
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    },
  });

  const handleOpenCompleteModal = (m: MaintenanceRecord) => {
    setSelectedForComplete(m);
    setCompleteForm({
      status: 'completed',
      completed_date: new Date().toISOString().split('T')[0],
      cost: m.cost || '',
      description: m.description,
    });
    setErrors({});
  };

  const getStatusBadge = (st: MaintenanceStatus) => {
    switch (st) {
      case 'scheduled':
        return <Badge variant="info">Programado</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En Progreso</Badge>;
      case 'completed':
        return <Badge variant="success">Completado</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelado</Badge>;
      default:
        return <Badge variant="default">{st}</Badge>;
    }
  };

  const canManageMaintenance = (m: MaintenanceRecord) => {
    return isSupervisor() || m.performed_by === user?.id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Mantenimiento de Activos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Planificación y registro de mantenimientos preventivos y correctivos de infraestructura.
          </p>
        </div>
        {isSupervisor() && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4" />
            <span>Programar Mantenimiento</span>
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todos los Tipos</option>
              <option value="preventive">Mantenimiento Preventivo</option>
              <option value="corrective">Mantenimiento Correctivo</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todos los Estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenances Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Activo</th>
                <th className="px-6 py-3.5">Tipo</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Fecha Programada</th>
                <th className="px-6 py-3.5">Técnico Asignado</th>
                <th className="px-6 py-3.5">Costo</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : maintenancesData?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron mantenimientos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                maintenancesData?.data.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">#{m.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {m.asset?.code} — {m.asset?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={m.type === 'preventive' ? 'info' : 'warning'}>
                        {m.type === 'preventive' ? 'Preventivo' : 'Correctivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(m.status)}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{m.scheduled_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {m.technician ? (
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                          <span>{m.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Por asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {m.cost ? `$${Number(m.cost).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManageMaintenance(m) && m.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCompleteModal(m)}
                          className="text-xs"
                        >
                          Actualizar / Concluir
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {maintenancesData?.meta && (
          <Pagination meta={maintenancesData.meta} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </Card>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Programar Mantenimiento"
        description="Registra la fecha y el tipo de servicio a realizar en el activo."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              ...formData,
              asset_id: Number(formData.asset_id),
              performed_by: formData.performed_by ? Number(formData.performed_by) : null,
              cost: formData.cost ? Number(formData.cost) : null,
            });
          }}
          className="space-y-4"
        >
          <Select
            label="Activo a Intervenir"
            value={formData.asset_id}
            onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
            options={assets.map((a) => ({ value: a.id, label: `${a.code} - ${a.name} (${a.status})` }))}
            placeholder="Selecciona el activo"
            error={errors.asset_id?.[0]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo de Mantenimiento"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
              options={[
                { value: 'preventive', label: 'Preventivo (Planificado)' },
                { value: 'corrective', label: 'Correctivo (Reparación)' },
              ]}
              required
            />

            <Input
              label="Fecha Programada"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              error={errors.scheduled_date?.[0]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Técnico Asignado"
              value={formData.performed_by || ''}
              onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
              options={technicians.map((t) => ({ value: t.id, label: t.name }))}
              placeholder="Asignar técnico"
            />

            <Input
              label="Costo Estimado ($)"
              type="number"
              step="0.01"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="0.00"
              error={errors.cost?.[0]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción de las Tareas Técnicas
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalle de limpieza, cambio de piezas o diagnóstico..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description[0]}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Programar Mantenimiento
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complete Maintenance Modal */}
      <Modal
        isOpen={selectedForComplete !== null}
        onClose={() => setSelectedForComplete(null)}
        title="Actualizar / Concluir Mantenimiento"
        description={`Mantenimiento #${selectedForComplete?.id} - ${selectedForComplete?.asset?.code}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedForComplete) {
              completeMutation.mutate({
                id: selectedForComplete.id,
                data: {
                  type: selectedForComplete.type,
                  status: completeForm.status,
                  scheduled_date: selectedForComplete.scheduled_date,
                  completed_date: completeForm.status === 'completed' ? completeForm.completed_date : null,
                  cost: completeForm.cost ? Number(completeForm.cost) : null,
                  description: completeForm.description,
                  performed_by: selectedForComplete.performed_by,
                },
              });
            }
          }}
          className="space-y-4"
        >
          <Select
            label="Estado"
            value={completeForm.status}
            onChange={(e) => setCompleteForm({ ...completeForm, status: e.target.value as MaintenanceStatus })}
            options={[
              { value: 'in_progress', label: 'En Progreso (Pone equipo en mantenimiento)' },
              { value: 'completed', label: 'Completado (Restaura equipo a Disponible/Asignado)' },
              { value: 'cancelled', label: 'Cancelado' },
            ]}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completeForm.status === 'completed' && (
              <Input
                label="Fecha de Conclusión"
                type="date"
                value={completeForm.completed_date}
                onChange={(e) => setCompleteForm({ ...completeForm, completed_date: e.target.value })}
                error={errors.completed_date?.[0]}
                required
              />
            )}

            <Input
              label="Costo Final ($)"
              type="number"
              step="0.01"
              value={completeForm.cost}
              onChange={(e) => setCompleteForm({ ...completeForm, cost: e.target.value })}
              placeholder="0.00"
              error={errors.cost?.[0]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Informe Técnico del Servicio
            </label>
            <textarea
              rows={3}
              value={completeForm.description}
              onChange={(e) => setCompleteForm({ ...completeForm, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedForComplete(null)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={completeMutation.isPending}>
              Guardar y Sincronizar Activo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
