import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderTree, MapPin, Trash2 } from 'lucide-react';
import { catalogApi } from '../../api/catalogApi';
import { Category, Location } from '../../types/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Loader } from '../../components/ui/Loader';

export const CatalogsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Category State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catError, setCatError] = useState<string | null>(null);

  // Location State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locParentId, setLocParentId] = useState('');
  const [locError, setLocError] = useState<string | null>(null);

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: locations = [], isLoading: loadingLocs } = useQuery({
    queryKey: ['locations'],
    queryFn: () => catalogApi.getLocations(),
  });

  // Mutations
  const createCatMutation = useMutation({
    mutationFn: () => catalogApi.createCategory({ name: catName, description: catDesc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCatModalOpen(false);
      setCatName('');
      setCatDesc('');
      setCatError(null);
    },
    onError: (err: any) => {
      setCatError(err.response?.data?.errors?.name?.[0] || 'Error al crear la categoría.');
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const createLocMutation = useMutation({
    mutationFn: () =>
      catalogApi.createLocation({
        name: locName,
        description: locDesc,
        parent_location_id: locParentId ? Number(locParentId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsLocModalOpen(false);
      setLocName('');
      setLocDesc('');
      setLocParentId('');
      setLocError(null);
    },
    onError: (err: any) => {
      setLocError(err.response?.data?.errors?.name?.[0] || 'Error al crear la ubicación.');
    },
  });

  const deleteLocMutation = useMutation({
    mutationFn: (id: number) => catalogApi.deleteLocation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Catálogos Auxiliares</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Administración de categorías de equipos y sedes/ubicaciones de la empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-brand-600" />
              <CardTitle>Categorías de Activos</CardTitle>
            </div>
            <Button size="sm" onClick={() => setIsCatModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Categoría</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {loadingCats ? (
              <Loader size="md" className="py-8" />
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No hay categorías registradas.</div>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                    {c.description && <p className="text-xs text-slate-500 mt-0.5">{c.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteCatMutation.mutate(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Locations Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <CardTitle>Sedes & Ubicaciones</CardTitle>
            </div>
            <Button size="sm" onClick={() => setIsLocModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Ubicación</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {loadingLocs ? (
              <Loader size="md" className="py-8" />
            ) : locations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No hay ubicaciones registradas.</div>
            ) : (
              locations.map((l) => (
                <div key={l.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{l.name}</p>
                      {l.parent && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          Sede: {l.parent.name}
                        </span>
                      )}
                    </div>
                    {l.description && <p className="text-xs text-slate-500 mt-0.5">{l.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteLocMutation.mutate(l.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Crear Nueva Categoría"
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createCatMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nombre de Categoría"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Laptops, Monitores, Servidores..."
            error={catError || undefined}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createCatMutation.isPending}>
              Guardar Categoría
            </Button>
          </div>
        </form>
      </Modal>

      {/* Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Crear Nueva Ubicación / Sede"
        maxWidth="sm"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createLocMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Nombre de Ubicación"
            value={locName}
            onChange={(e) => setLocName(e.target.value)}
            placeholder="Edificio Principal, Piso 3, Sala IT..."
            error={locError || undefined}
            required
          />

          <Select
            label="Sede / Ubicación Padre (Opcional)"
            value={locParentId}
            onChange={(e) => setLocParentId(e.target.value)}
            options={locations.map((l) => ({ value: l.id, label: l.name }))}
            placeholder="Ninguna (Ubicación raíz)"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              value={locDesc}
              onChange={(e) => setLocDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsLocModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={createLocMutation.isPending}>
              Guardar Ubicación
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
