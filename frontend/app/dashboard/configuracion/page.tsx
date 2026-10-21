'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Plus, Search, Box, Calendar, Edit, Trash2, ChevronRight, X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';

export default function ConfiguracionEmpresaPage() {
    const { user } = useAuth();
    
    // --- ESTADOS REALES ---
    const [sedes, setSedes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [selectedSedeId, setSelectedSedeId] = useState<number | null>(null);
    const [busquedaSede, setBusquedaSede] = useState('');
    
    // --- ESTADOS DE MODALES ---
    const [showSedeModal, setShowSedeModal] = useState(false);
    const [showAlcanceModal, setShowAlcanceModal] = useState(false);
    
    const [sedeFormData, setSedeFormData] = useState({ nombre: '', departamento: '', provincia: '', distrito: '' });
    const [alcanceFormData, setAlcanceFormData] = useState({ tipo: 'Producto', nombre: '', anio: new Date().getFullYear(), fecha_inicio: '', fecha_fin: '' });

    // --- CARGA INICIAL DE DATOS ---
    const fetchSedes = async () => {
        try {
            const { data } = await api.get('/sedes/detalle');
            setSedes(data);
            if (data.length > 0 && !selectedSedeId) setSelectedSedeId(data[0].id_sede);
        } catch (error) {
            console.error("Error al cargar sedes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSedes();
    }, []);

    // --- DERIVADOS ---
    const selectedSede = sedes.find(s => s.id_sede === selectedSedeId);
    const sedesFiltradas = sedes.filter(s => s.nombre.toLowerCase().includes(busquedaSede.toLowerCase()));
    const totalAlcances = sedes.reduce((acc, s) => acc + (s.alcances?.length || 0), 0);
    const totalPeriodos = sedes.reduce((acc, s) => acc + (s.alcances?.reduce((acc2: number, a: any) => acc2 + (a.periodos?.length || 0), 0) || 0), 0);

    // --- MANEJADORES DE API ---
    const handleGuardarSede = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sedeFormData.nombre || !sedeFormData.departamento || !sedeFormData.provincia || !sedeFormData.distrito) {
            return toast.error("Todos los campos de la sede son obligatorios");
        }
        setIsSaving(true);
        try {
            await api.post('/sedes', sedeFormData);
            toast.success("Sede creada con éxito");
            setShowSedeModal(false);
            setSedeFormData({ nombre: '', departamento: '', provincia: '', distrito: '' });
            fetchSedes();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al crear la sede");
        } finally {
            setIsSaving(false);
        }
    };

    const handleGuardarAlcance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!alcanceFormData.nombre || !alcanceFormData.fecha_inicio || !alcanceFormData.fecha_fin) {
            return toast.error("Completa todos los campos del alcance");
        }
        if (new Date(alcanceFormData.fecha_inicio) > new Date(alcanceFormData.fecha_fin)) {
            return toast.error("La fecha de inicio no puede ser mayor a la fecha final");
        }
        setIsSaving(true);
        try {
            await api.post('/alcances', { ...alcanceFormData, id_sede: selectedSedeId });
            toast.success("Alcance y periodo creados con éxito");
            setShowAlcanceModal(false);
            setAlcanceFormData({ tipo: 'Producto', nombre: '', anio: new Date().getFullYear(), fecha_inicio: '', fecha_fin: '' });
            fetchSedes();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al crear el alcance");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center text-blue-600"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de Empresa</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Dale estructura a tu organización: Sedes, Alcances y Periodos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-600 rounded-2xl p-5 shadow-lg shadow-blue-600/20 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Organización</p>
                        <h3 className="font-bold text-lg truncate" title="Mi Organización">Mi Organización</h3>
                    </div>
                    <Building2 className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24" />
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><MapPin size={24} /></div>
                    <div>
                        <p className="text-2xl font-black text-gray-800 dark:text-white">{sedes.length}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sedes</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Box size={24} /></div>
                    <div>
                        <p className="text-2xl font-black text-gray-800 dark:text-white">{totalAlcances}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alcances</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Calendar size={24} /></div>
                    <div>
                        <p className="text-2xl font-black text-gray-800 dark:text-white">{totalPeriodos}</p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Periodos</p>
                    </div>
                </div>
            </div>

            {/* Layout Principal: 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLUMNA IZQUIERDA: Sedes */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Building2 size={18} className="text-blue-500" /> Tus Sedes
                            </h2>
                            <button onClick={() => setShowSedeModal(true)} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 p-1.5 rounded-lg transition-colors" title="Añadir sede">
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                value={busquedaSede}
                                onChange={(e) => setBusquedaSede(e.target.value)}
                                placeholder="Buscar sede..." 
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {sedesFiltradas.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 mt-10">No hay sedes registradas.</p>
                        ) : (
                            sedesFiltradas.map((sede: any) => (
                                <div 
                                    key={sede.id_sede} 
                                    onClick={() => setSelectedSedeId(sede.id_sede)}
                                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selectedSedeId === sede.id_sede ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-transparent hover:border-gray-200 dark:hover:border-slate-600 bg-gray-50 dark:bg-slate-900/30'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-bold ${selectedSedeId === sede.id_sede ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>{sede.nombre}</h4>
                                        <ChevronRight size={18} className={selectedSedeId === sede.id_sede ? 'text-blue-500' : 'text-gray-300 dark:text-slate-600'} />
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin size={12} /> {sede.distrito}, {sede.departamento}</p>
                                    <div className="mt-3 flex gap-2">
                                        <span className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                            {sede.alcances?.length || 0} Alcances
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Detalle de Sede y Alcances */}
                <div className="lg:col-span-8">
                    {selectedSede ? (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm h-[600px] flex flex-col">
                            {/* Cabecera Sede Seleccionada */}
                            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Building2 size={20} /></div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedSede.nombre}</h2>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 ml-1">
                                        <MapPin size={14} /> {selectedSede.distrito} · {selectedSede.provincia} · {selectedSede.departamento}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Edit size={18} /></button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            {/* Zona de Alcances */}
                            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-slate-900/20">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-gray-200">Alcances Operativos</h3>
                                        <p className="text-xs text-gray-500">Cada producto o servicio tiene su propio periodo.</p>
                                    </div>
                                    <button onClick={() => setShowAlcanceModal(true)} className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md">
                                        <Plus size={16} /> Añadir Alcance
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {!selectedSede.alcances || selectedSede.alcances.length === 0 ? (
                                        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                                            <Box size={32} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
                                            <p className="text-gray-500 font-medium text-sm">No hay alcances registrados en esta sede.</p>
                                        </div>
                                    ) : (
                                        selectedSede.alcances.map((alcance: any) => (
                                            <div key={alcance.id_alcance} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 inline-block ${alcance.tipo === 'Producto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                                                            {alcance.tipo}
                                                        </span>
                                                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">{alcance.nombre}</h4>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-slate-900 rounded-lg"><Edit size={16} /></button>
                                                        <button className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 dark:bg-slate-900 rounded-lg"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>

                                                {/* Periodos del Alcance */}
                                                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700 p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Periodos Registrados</span>
                                                        <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                                            <Plus size={12} /> Añadir Año
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {alcance.periodos?.map((periodo: any) => (
                                                            <div key={periodo.id_periodo} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-black text-gray-800 dark:text-gray-200">{periodo.anio}</span>
                                                                    <div className="h-4 w-px bg-gray-300 dark:bg-slate-600"></div>
                                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                                        {new Date(periodo.fecha_inicio).toLocaleDateString('es-PE')} - {new Date(periodo.fecha_fin).toLocaleDateString('es-PE')}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium">Periodo configurado</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm h-[600px] flex items-center justify-center text-center p-8">
                            <div>
                                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building2 size={32} className="text-gray-300 dark:text-slate-600" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Selecciona una sede en el panel izquierdo para ver sus alcances.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL: NUEVA SEDE */}
            {showSedeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                <Building2 size={20} className="text-blue-600" /> Nueva Sede
                            </h3>
                            <button onClick={() => setShowSedeModal(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleGuardarSede} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre de la sede <span className="text-red-500">*</span></label>
                                <input type="text" value={sedeFormData.nombre} onChange={e => setSedeFormData({...sedeFormData, nombre: e.target.value})} placeholder="Ej: Fundo Laredo" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Departamento <span className="text-red-500">*</span></label>
                                    <input type="text" value={sedeFormData.departamento} onChange={e => setSedeFormData({...sedeFormData, departamento: e.target.value})} placeholder="Ej: La Libertad" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Provincia <span className="text-red-500">*</span></label>
                                    <input type="text" value={sedeFormData.provincia} onChange={e => setSedeFormData({...sedeFormData, provincia: e.target.value})} placeholder="Ej: Trujillo" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Distrito / Ciudad <span className="text-red-500">*</span></label>
                                    <input type="text" value={sedeFormData.distrito} onChange={e => setSedeFormData({...sedeFormData, distrito: e.target.value})} placeholder="Ej: Laredo" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowSedeModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Sede
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: NUEVO ALCANCE */}
            {showAlcanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                                    <Box size={20} className="text-blue-600" /> Nuevo Alcance
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Para: {selectedSede?.nombre}</p>
                            </div>
                            <button onClick={() => setShowAlcanceModal(false)} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleGuardarAlcance} className="p-6 space-y-5">
                            
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                    El alcance segmenta a tus trabajadores. Cada producto o servicio puede tener su propia base de datos y su propio periodo anual.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tipo <span className="text-red-500">*</span></label>
                                    <select value={alcanceFormData.tipo} onChange={e => setAlcanceFormData({...alcanceFormData, tipo: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                                        <option value="Producto">Producto</option>
                                        <option value="Servicio">Servicio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nombre del Alcance <span className="text-red-500">*</span></label>
                                    <input type="text" value={alcanceFormData.nombre} onChange={e => setAlcanceFormData({...alcanceFormData, nombre: e.target.value})} placeholder="Ej: Palta Fresca" className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-slate-700 pt-5">
                                <h4 className="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest mb-4">Periodo Inicial</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Año <span className="text-red-500">*</span></label>
                                        <input type="number" value={alcanceFormData.anio} onChange={e => setAlcanceFormData({...alcanceFormData, anio: parseInt(e.target.value)})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fecha Inicio <span className="text-red-500">*</span></label>
                                        <input type="date" value={alcanceFormData.fecha_inicio} onChange={e => setAlcanceFormData({...alcanceFormData, fecha_inicio: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fecha Final <span className="text-red-500">*</span></label>
                                        <input type="date" value={alcanceFormData.fecha_fin} onChange={e => setAlcanceFormData({...alcanceFormData, fecha_fin: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" required />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAlcanceModal(false)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Crear Alcance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}