import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  CheckCheck,
  UserCheck,
} from 'lucide-react';
import { incidentsApi } from '../../api/incidentsApi';
import { assetsApi } from '../../api/assetsApi';
import { catalogApi } from '../../api/catalogApi';
import { Incident, IncidentFormData, IncidentSeverity, IncidentStatus } from '../../types/incident';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Loader } from '../../components/ui/Loader';

export const IncidentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, isSupervisor } = useAuth();

  // Filters State
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIncidentForStatus, setSelectedIncidentForStatus] = useState<Incident | null>(null);

  // Form states
  const [formData, setFormData] = useState<IncidentFormData>({
    asset_id: '',
    severity: 'medium',
    description: '',
    assigned_to: '',
  });
  const [statusForm, setStatusForm] = useState<{ status: IncidentStatus; resolution_notes: string }>({
    status: 'in_progress',
    resolution_notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Queries
  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['incidents', { severity, status, page }],
    queryFn: () =>
      incidentsApi.getIncidents({
        severity: severity || undefined,
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
    mutationFn: (data: IncidentFormData) => incidentsApi.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsCreateModalOpen(false);
      setFormData({ asset_id: '', severity: 'medium', description: '', assigned_to: '' });
      setErrors({});
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: IncidentStatus; resolution_notes?: string } }) =>
      incidentsApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelectedIncidentForStatus(null);
      setStatusForm({ status: 'in_progress', resolution_notes: '' });
      setErrors({});
    },
    onError: (err: any) => {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
    },
  });

  const handleOpenStatusModal = (incident: Incident) => {
    setSelectedIncidentForStatus(incident);
    setStatusForm({
      status: incident.status,
      resolution_notes: incident.resolution_notes || '',
    });
    setErrors({});
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="danger">Crítica</Badge>;
      case 'high':
        return <Badge variant="warning">Alta</Badge>;
      case 'medium':
        return <Badge variant="info">Media</Badge>;
      default:
        return <Badge variant="default">Baja</Badge>;
    }
  };

  const getStatusBadge = (st: IncidentStatus) => {
    switch (st) {
      case 'open':
        return <Badge variant="danger">Abierta</Badge>;
      case 'assigned':
        return <Badge variant="purple">Asignada</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En Progreso</Badge>;
      case 'resolved':
        return <Badge variant="success">Resuelta</Badge>;
      case 'closed':
        return <Badge variant="default">Cerrada</Badge>;
      default:
        return <Badge variant="default">{st}</Badge>;
    }
  };

  const canManageIncident = (incident: Incident) => {
    return isSupervisor() || incident.assigned_to === user?.id;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Módulo de Incidencias</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Reporte de fallas técnicas, asignación a soporte y seguimiento de resoluciones.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="shrink-0">
          <Plus className="w-4 h-4" />
          <span>Reportar Incidencia</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">Todas las Severidades</option>
              <option value="critical">Crítica (Pone equipo en mantenimiento)</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
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
              <option value="open">Abierta</option>
              <option value="assigned">Asignada</option>
              <option value="in_progress">En Progreso</option>
              <option value="resolved">Resuelta</option>
              <option value="closed">Cerrada</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Activo Afectado</th>
                <th className="px-6 py-3.5">Severidad</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Reportado Por</th>
                <th className="px-6 py-3.5">Técnico Asignado</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader size="md" />
                  </td>
                </tr>
              ) : incidentsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron incidencias con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                incidentsData?.data.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">#{incident.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {incident.asset?.code} — {incident.asset?.name}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{incident.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getSeverityBadge(incident.severity)}</td>
                    <td className="px-6 py-4">{getStatusBadge(incident.status)}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {incident.reporter?.name || 'Usuario'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {incident.assignee ? (
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                          <span>{incident.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin técnico asignado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canManageIncident(incident) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenStatusModal(incident)}
                          className="text-xs"
                        >
                          Actualizar Estado
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {incidentsData?.meta && (
          <Pagination meta={incidentsData.meta} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </Card>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Reportar Nueva Incidencia"
        description="Indica el equipo afectado y detalla el inconveniente técnico."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              ...formData,
              asset_id: Number(formData.asset_id),
              assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
            });
          }}
          className="space-y-4"
        >
          <Select
            label="Activo Afectado"
            value={formData.asset_id}
            onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
            options={assets.map((a) => ({ value: a.id, label: `${a.code} - ${a.name} (${a.status})` }))}
            placeholder="Selecciona el activo"
            error={errors.asset_id?.[0]}
            required
          />

          <Select
            label="Severidad del Problema"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
            options={[
              { value: 'low', label: 'Baja (Inconveniente menor)' },
              { value: 'medium', label: 'Media (Degradación de rendimiento)' },
              { value: 'high', label: 'Alta (Falla parcial)' },
              { value: 'critical', label: 'Crítica (Equipo inoperativo / Bloquea labores)' },
            ]}
            error={errors.severity?.[0]}
            required
          />

          {isSupervisor() && (
            <Select
              label="Asignar Técnico de Soporte (Opcional)"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              options={technicians.map((t) => ({ value: t.id, label: t.name }))}
              placeholder="Asignar más tarde"
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción del Problema
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explica detalladamente qué sucede..."
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
              Reportar Incidencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={selectedIncidentForStatus !== null}
        onClose={() => setSelectedIncidentForStatus(null)}
        title="Actualizar Estado de Incidencia"
        description={`Incidencia #${selectedIncidentForStatus?.id} - ${selectedIncidentForStatus?.asset?.code}`}
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedIncidentForStatus) {
              updateStatusMutation.mutate({
                id: selectedIncidentForStatus.id,
                data: statusForm,
              });
            }
          }}
          className="space-y-4"
        >
          <Select
            label="Nuevo Estado"
            value={statusForm.status}
            onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as IncidentStatus })}
            options={[
              { value: 'open', label: 'Abierta' },
              { value: 'assigned', label: 'Asignada' },
              { value: 'in_progress', label: 'En Progreso / Diagnóstico' },
              { value: 'resolved', label: 'Resuelta (Solución completada)' },
              { value: 'closed', label: 'Cerrada' },
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notas de Resolución / Diagnóstico {statusForm.status === 'resolved' && <span className="text-rose-500">*</span>}
            </label>
            <textarea
              rows={3}
              value={statusForm.resolution_notes}
              onChange={(e) => setStatusForm({ ...statusForm, resolution_notes: e.target.value })}
              placeholder="Indica qué trabajo técnico se realizó para solucionar la falla..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required={statusForm.status === 'resolved'}
            />
            {errors.resolution_notes && (
              <p className="text-xs text-rose-600 mt-1">{errors.resolution_notes[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSelectedIncidentForStatus(null)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={updateStatusMutation.isPending}>
              Guardar Estado
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
