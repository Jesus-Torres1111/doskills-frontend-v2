'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/services/api';
import { 
    Users, Search, Plus, Edit, Trash2, Save, X, CheckCircle2, 
    UploadCloud, Loader2, ChevronLeft, ChevronRight, FileSpreadsheet, 
    Filter, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrabajadoresPage() {
    // --- ESTADOS DE DATOS ---
    const [lista, setLista] = useState<any[]>([]);
    const [sedes, setSedes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    // --- FILTROS V2 ---
    const [filtroSede, setFiltroSede] = useState('');
    const [filtroAlcance, setFiltroAlcance] = useState('');
    const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

    // --- MODALES Y UI ---
    const [modalOpen, setModalOpen] = useState(false);
    const [modalExcelOpen, setModalExcelOpen] = useState(false);
    const [previewExcel, setPreviewExcel] = useState<any>(null); // Para la vista previa V2
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FORMULARIO V2 ---
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const gruposSeleccionados = watch('grupos') || [];

    // --- CARGA INICIAL ---
    const fetchData = async () => {
        try {
            // Cargamos sedes para los filtros y trabajadores
            const [sedesRes, trabRes] = await Promise.all([
                api.get('/sedes/detalle').catch(() => ({ data: [] })),
                api.get('/trabajadores/listado').catch(() => ({ data: [] }))
            ]);
            
            setSedes(sedesRes.data);
            if (sedesRes.data.length > 0) setFiltroSede(sedesRes.data[0].id_sede.toString());
            
            // Adaptamos la data V1 a la vista V2 temporalmente
            const adaptados = trabRes.data.map((t: any) => ({
                ...t,
                estado: t.estado || 'Activo', // Activo, Cesado, Por ingresar
                edad: t.fecha_nacimiento ? new Date().getFullYear() - new Date(t.fecha_nacimiento).getFullYear() : '--'
            }));
            setLista(adaptados);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- DERIVADOS PARA FILTROS ---
    const sedeActual = sedes.find(s => s.id_sede.toString() === filtroSede);
    const alcancesActuales = sedeActual?.alcances || [];
    
    // Filtrado local
    const filtrados = lista.filter(t => 
        (`${t.apellidos} ${t.nombres}`).toLowerCase().includes(busqueda.toLowerCase()) || 
        (t.dni || "").includes(busqueda)
    );

    // --- MANEJADORES ---
    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/trabajadores/${editingId}`, data);
                toast.success("Trabajador actualizado");
            } else {
                await api.post('/trabajadores', data);
                toast.success("Trabajador registrado");
            }
            fetchData();
            setModalOpen(false);
            reset();
            setEditingId(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al guardar");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (t: any) => {
        setEditingId(t.id_trabajador);
        reset({
            ...t,
            // Si la BD V1 tiene el nombre completo, simulamos la V2 para el form
            apellido_paterno: t.apellidos?.split(' ')[0] || '',
            apellido_materno: t.apellidos?.split(' ')[1] || '',
            nombres: t.nombres || '',
            grupos: t.categoria ? [t.categoria] : []
        });
        setModalOpen(true);
    };

    const handleEliminar = async (id: number) => {
        if (!confirm("¿Seguro que deseas eliminar este trabajador?")) return;
        try {
            await api.delete(`/trabajadores/${id}`);
            toast.success("Trabajador eliminado");
            fetchData();
        } catch (error) {
            toast.error("Error al eliminar el trabajador");
        }
    };

    // --- SIMULACIÓN IMPORTACIÓN V2 ---
    const handleSimularImportacion = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Simulamos la lectura del Excel para mostrar la vista previa exigida en V2
        setIsSubmitting(true);
        setTimeout(() => {
            setPreviewExcel({
                nuevos: 42,
                actualizados: 15,
                sin_cambios: 120,
                total: 177,
                filasPreview: [
                    { dni: '76152140', nombre: 'Perez Juan', accion: 'Nuevo' },
                    { dni: '45127896', nombre: 'Gomez Ana', accion: 'Actualizado' },
                    { dni: '09876543', nombre: 'Rojas Luis', accion: 'Sin cambios' }
                ]
            });
            setIsSubmitting(false);
        }, 1000);
    };

    const handleConfirmarImportacion = async () => {
        setIsSubmitting(true);
        try {
            // Aquí iría el api.post('/trabajadores/importar-excel', formData)
            toast.success(`Se importaron ${previewExcel.nuevos + previewExcel.actualizados} registros con éxito`);
            setModalExcelOpen(false);
            setPreviewExcel(null);
            fetchData();
        } catch (error) {
            toast.error("Error al importar");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleGrupo = (grupo: string) => {
        const actuales = [...gruposSeleccionados];
        if (actuales.includes(grupo)) {
            setValue('grupos', actuales.filter(g => g !== grupo));
        } else {
            setValue('grupos', [...actuales, grupo]);
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-blue-600"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="space-y-6 relative pb-20 animate-in fade-in duration-500">
            
            {/* ENCABEZADO Y FILTROS V2 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Users className="text-blue-600 dark:text-blue-400" /> Padrón de Trabajadores
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona el personal activo por sede y alcance operativo.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setModalExcelOpen(true)} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors border border-emerald-200 dark:border-emerald-800/50">
                            <FileSpreadsheet size={18} /> Importar Excel
                        </button>
                        <button onClick={() => { setEditingId(null); reset({ genero: 'M', grupos: [] }); setModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-bold flex items-center gap-2 transition shadow-md shadow-blue-500/20 active:scale-95">
                            <Plus size={18} /> Añadir Trabajador
                        </button>
                    </div>
                </div>

                {/* BARRA DE FILTROS OBLIGATORIOS (V2) */}
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">1. Sede</label>
                        <select value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                            {sedes.length === 0 && <option value="">Sin sedes</option>}
                            {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">2. Alcance</label>
                        <select value={filtroAlcance} onChange={(e) => setFiltroAlcance(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="">Todos los alcances</option>
                            {alcancesActuales.map((a: any) => <option key={a.id_alcance} value={a.id_alcance}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">3. Año</label>
                        <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white">
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* BARRA DE BÚSQUEDA Y STATS */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Buscar por DNI o Nombre..." value={busqueda} onChange={e => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white shadow-sm" />
                </div>
                <div className="flex gap-4 text-sm font-medium">
                    <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-gray-600 dark:text-gray-300">
                        Activos: <b className="text-emerald-600 dark:text-emerald-400">{filtrados.filter(t => t.estado === 'Activo').length}</b>
                    </span>
                    <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm text-gray-600 dark:text-gray-300">
                        Cesados: <b className="text-red-600 dark:text-red-400">{filtrados.filter(t => t.estado === 'Cesado').length}</b>
                    </span>
                </div>
            </div>

            {/* TABLA DE TRABAJADORES V2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">DNI</th>
                                <th className="px-6 py-4 whitespace-nowrap">Trabajador (Apellidos y Nombres)</th>
                                <th className="px-6 py-4 whitespace-nowrap">Área / Subárea</th>
                                <th className="px-6 py-4 whitespace-nowrap">Cargo</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Estado</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filtrados.map(t => (
                                <tr key={t.id_trabajador} className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-blue-600 dark:text-blue-400 font-bold">{t.dni}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800 dark:text-gray-100">{t.apellidos} {t.nombres}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.edad} años</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        <div className="font-bold text-gray-700 dark:text-gray-200">{t.area}</div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500">{t.subarea || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-300">{t.cargo}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                            t.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                            t.estado === 'Cesado' ? 'bg-red-50 text-red-700 border-red-200' : 
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {t.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(t)} className="p-2 text-amber-600 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm active:scale-95"><Edit size={16} /></button>
                                            <button onClick={() => handleEliminar(t.id_trabajador)} className="p-2 text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm active:scale-95"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No se encontraron trabajadores en este alcance.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL: IMPORTAR EXCEL CON VISTA PREVIA (V2) */}
            {modalExcelOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl p-6 border border-gray-100 dark:border-slate-700 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="text-emerald-600" /> Importar Trabajadores
                            </h3>
                            <button onClick={() => { setModalExcelOpen(false); setPreviewExcel(null); }} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
                        </div>

                        {!previewExcel ? (
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-bold mb-2">Instrucciones de Importación (V2):</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Sube el archivo Excel (máx 5MB, 2000 filas).</li>
                                        <li>Se añadirán los nuevos y se actualizarán los existentes (por DNI).</li>
                                        <li>Los trabajadores omitidos en el Excel conservarán su estado actual.</li>
                                    </ul>
                                </div>
                                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer relative">
                                    <UploadCloud size={40} className="mx-auto text-blue-500 mb-4" />
                                    <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">Haz clic para subir tu Excel (.xlsx, .csv)</p>
                                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleSimularImportacion} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {isSubmitting && <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center rounded-2xl"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                                <h4 className="font-black text-[11px] uppercase tracking-widest text-gray-500 mb-3 shrink-0">Revisar antes de guardar</h4>
                                
                                <div className="grid grid-cols-3 gap-3 mb-4 shrink-0">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{previewExcel.nuevos}</p>
                                        <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-500">Nuevos</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{previewExcel.actualizados}</p>
                                        <p className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-500">Actualizados</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 p-3 rounded-xl text-center">
                                        <p className="text-2xl font-black text-gray-600 dark:text-gray-300">{previewExcel.sin_cambios}</p>
                                        <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Sin Cambios</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900/20 p-2 custom-scrollbar">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-[10px] uppercase text-gray-500 bg-gray-100 dark:bg-slate-800 rounded-lg">
                                            <tr>
                                                <th className="p-2">DNI</th>
                                                <th className="p-2">Nombre</th>
                                                <th className="p-2 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewExcel.filasPreview.map((f: any, i: number) => (
                                                <tr key={i} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                                                    <td className="p-2 font-mono text-gray-600 dark:text-gray-300">{f.dni}</td>
                                                    <td className="p-2 font-bold text-gray-800 dark:text-gray-200">{f.nombre}</td>
                                                    <td className="p-2 text-right">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${f.accion === 'Nuevo' ? 'bg-emerald-100 text-emerald-700' : f.accion === 'Actualizado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                                            {f.accion}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex gap-3 pt-5 mt-auto shrink-0 border-t border-gray-100 dark:border-slate-700">
                                    <button onClick={() => setPreviewExcel(null)} className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">Volver sin guardar</button>
                                    <button onClick={handleConfirmarImportacion} disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Confirmar y Guardar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: FORMULARIO INDIVIDUAL V2 */}
            {modalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 sticky top-0">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                {editingId ? <Edit className="text-amber-500" /> : <Users className="text-blue-500" />}
                                {editingId ? 'Editar Trabajador' : 'Nuevo Trabajador'}
                            </h3>
                            <button onClick={() => setModalOpen(false)}><X className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            
                            {/* BLOQUE 1: DATOS PERSONALES */}
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Datos Personales</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">DNI <span className="text-red-500">*</span></label>
                                        <input {...register("dni", { required: true })} maxLength={8} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Nombres <span className="text-red-500">*</span></label>
                                        <input {...register("nombres", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Ap. Paterno <span className="text-red-500">*</span></label>
                                        <input {...register("apellido_paterno", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Ap. Materno <span className="text-red-500">*</span></label>
                                        <input {...register("apellido_materno", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">F. Nacimiento <span className="text-red-500">*</span></label>
                                        <input type="date" {...register("fecha_nacimiento", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Género <span className="text-red-500">*</span></label>
                                        <select {...register("genero")} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* BLOQUE 2: DATOS LABORALES */}
                            <div>
                                <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">Datos Laborales</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Área <span className="text-red-500">*</span></label>
                                        <input {...register("area", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Subárea (Opcional)</label>
                                        <input {...register("subarea")} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Cargo <span className="text-red-500">*</span></label>
                                        <input {...register("cargo", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">F. Ingreso <span className="text-red-500">*</span></label>
                                            <input type="date" {...register("fecha_ingreso", { required: true })} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">F. Cese (Opcional)</label>
                                            <input type="date" {...register("fecha_cese")} className="w-full border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-xs dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* GRUPOS Y COMITÉS (V2 MULTIPLE SELECTION) */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block">Grupos / Comités (Opcional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['BRIGADISTA', 'BRIGADISTA FEN', 'CIFHS', 'EDS', 'SUBCOMITÉ DE SST'].map(grupo => (
                                            <button
                                                key={grupo}
                                                type="button"
                                                onClick={() => toggleGrupo(grupo)}
                                                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black tracking-widest transition-all ${
                                                    gruposSeleccionados.includes(grupo) 
                                                    ? 'bg-purple-600 border-purple-600 text-white shadow-md' 
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-purple-400'
                                                }`}
                                            >
                                                {grupo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3 border-t border-gray-100 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Guardar Trabajador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}