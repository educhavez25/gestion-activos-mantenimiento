import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Laptop,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Clock,
  Flame,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Loader } from '../../components/ui/Loader';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  if (isLoading) {
    return <Loader size="lg" className="py-24" />;
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Error al cargar los datos del dashboard. Asegúrate de que el servidor backend esté en ejecución.
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total de Activos',
      value: stats.assets.total,
      subtitle: `${stats.assets.available} disponibles / ${stats.assets.assigned} asignados`,
      icon: Laptop,
      color: 'from-blue-600 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'En Mantenimiento',
      value: stats.assets.in_maintenance,
      subtitle: `${stats.assets.retired} dados de baja`,
      icon: Wrench,
      color: 'from-amber-600 to-yellow-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Incidencias Críticas',
      value: stats.incidents.critical,
      subtitle: `${stats.incidents.open} incidencias abiertas`,
      icon: Flame,
      color: 'from-rose-600 to-red-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      title: 'Costo Mantenimiento (Mes)',
      value: `$${Number(stats.maintenances.monthly_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtitle: `Total histórico: $${Number(stats.maintenances.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-green-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="danger">Abierta</Badge>;
      case 'in_progress':
        return <Badge variant="warning">En Progreso</Badge>;
      case 'resolved':
        return <Badge variant="success">Resuelta</Badge>;
      case 'closed':
        return <Badge variant="default">Cerrada</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Panel de Control</h2>
        <p className="text-sm text-slate-500 mt-1">
          Visión consolidada del parque tecnológico, incidencias activas y costos de soporte.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bgColor} ${kpi.textColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{kpi.subtitle}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two columns: Recent Incidents & Upcoming Maintenances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidencias Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <CardTitle>Incidencias Recientes</CardTitle>
            </div>
            <Link to="/incidents" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {stats.recent_incidents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No hay incidencias registradas.</div>
            ) : (
              stats.recent_incidents.map((incident) => (
                <div key={incident.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {incident.asset?.code || 'Activo'} - {incident.asset?.name}
                      </span>
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{incident.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>Reportado por: {incident.reporter?.name || 'Usuario'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 'Hoy'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Próximos Mantenimientos */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-brand-500" />
              <CardTitle>Próximos Mantenimientos</CardTitle>
            </div>
            <Link to="/maintenances" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Ver calendario <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {stats.upcoming_maintenances.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No hay mantenimientos programados.</div>
            ) : (
              stats.upcoming_maintenances.map((mnt) => (
                <div key={mnt.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {mnt.asset?.code} - {mnt.asset?.name}
                      </span>
                      <Badge variant={mnt.type === 'preventive' ? 'info' : 'warning'}>
                        {mnt.type === 'preventive' ? 'Preventivo' : 'Correctivo'}
                      </Badge>
                      <Badge variant={mnt.status === 'in_progress' ? 'warning' : 'default'}>
                        {mnt.status === 'in_progress' ? 'En Progreso' : 'Programado'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{mnt.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>Fecha: <strong className="text-slate-700">{mnt.scheduled_date}</strong></span>
                      {mnt.technician && (
                        <>
                          <span>•</span>
                          <span>Técnico: {mnt.technician.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
