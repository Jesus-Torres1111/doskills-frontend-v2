'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, UserPlus, Pencil, Trash2, Mail, X, Save, CheckCircle2, Loader2, Building2, Box, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

export default function RolesPermisosPage() {
    const { user } = useAuth();
    
    // --- ESTADOS DINÁMICOS (Sin interfaces falsas) ---
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [sedes, setSedes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ESTADOS DE UI ---
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    // --- FORMULARIO V2 ---
    const [formData, setFormData] = useState({
        rol: 'Capacitador',
        email: '',
        nombres: '',
        apellidos: '',
        cargo: '',
        area: '',
        id_sede: '',
        id_alcance: '',
        estado: true
    });

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        try {
            const [resUsers, resSedes] = await Promise.all([
                api.get('/usuarios').catch(() => ({ data: [] })),
                api.get('/sedes/detalle').catch(() => ({ data: [] }))
            ]);
            setUsuarios(resUsers.data);
            setSedes(resSedes.data);
        } catch (error) {
            console.error("Error cargando accesos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- DERIVADOS ---
    const sedeSeleccionada = sedes.find(s => s.id_sede?.toString() === formData.id_sede);
    const alcancesDisponibles = sedeSeleccionada?.alcances || [];

    // --- MANEJADORES ---
    const handleOpenModal = (usuarioToEdit: any = null) => {
        if (usuarioToEdit) {
            setEditingId(usuarioToEdit.id_usuario);
            setFormData({
                rol: usuarioToEdit.rol || 'Capacitador',
                email: usuarioToEdit.email || '',
                nombres: usuarioToEdit.nombres || usuarioToEdit.nombre || '',
                apellidos: usuarioToEdit.apellidos || '',
                cargo: usuarioToEdit.cargo || '',
                area: usuarioToEdit.area || '',
                id_sede: usuarioToEdit.id_sede?.toString() || '',
                id_alcance: usuarioToEdit.id_alcance?.toString() || '',
                estado: usuarioToEdit.estado !== false
            });
        } else {
            setEditingId(null);
            setFormData({ rol: 'Capacitador', email: '', nombres: '', apellidos: '', cargo: '', area: '', id_sede: '', id_alcance: '', estado: true });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/usuarios/${editingId}`, formData);
                toast.success("Permisos de usuario actualizados");
            } else {
                await api.post('/usuarios', formData);
                toast.success("Usuario invitado/creado con éxito");
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al guardar los permisos");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmEliminar = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/usuarios/${userToDelete}`);
            toast.success("Acceso revocado correctamente");
            setUserToDelete(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al eliminar");
        }
    };

    const handleReenviarInvitacion = async (email: string) => {
        const idToast = toast.loading("Enviando correo de acceso...");
        try {
            await api.post('/auth/recuperar', { usuario: email });
            toast.success("Correo enviado", { id: idToast });
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error al enviar correo", { id: idToast });
        }
    };

    if (isLoading) return <div className="p-10 flex justify-center text-blue-600"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="space-y-6 relative pb-20 animate-in fade-in duration-500">
            
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="text-blue-600" /> Configuración de Roles y Permisos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Administra quién tiene acceso al sistema y qué datos puede ver.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 font-bold active:scale-95">
                    <UserPlus size={18} /> Añadir Rol / Usuario
                </button>
            </div>

            {/* TABLA DE ROLES V2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold border-b dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Cargo / Área</th>
                                <th className="px-6 py-4">Rol Asignado</th>
                                <th className="px-6 py-4">Alcance Operativo</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay usuarios registrados.</td>
                                </tr>
                            ) : usuarios.map((u: any) => (
                                <tr key={u.id_usuario} className="hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center font-black shadow-inner">
                                                {(u.nombres || u.nombre || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {u.nombres || u.nombre} {u.apellidos}
                                                    {/* Rótulo V2 de Superadmin para el ID 1 */}
                                                    {u.id_usuario === 1 && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-black uppercase">Superadmin</span>}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{u.email || u.usuario}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{u.cargo || '-'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{u.area || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${
                                            u.rol?.toLowerCase() === 'administrador' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50' : 
                                            u.rol?.toLowerCase() === 'capacitador' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50' : 
                                            'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600'
                                        }`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1"><Building2 size={12} /> {u.id_sede ? 'Sede Específica' : 'Todas las Sedes'}</span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Box size={12} /> {u.id_alcance ? 'Alcance Restringido' : 'Acceso Global'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${u.estado !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20'}`}>
                                            {u.estado !== false ? 'Activo' : 'Baja'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleReenviarInvitacion(u.email || u.usuario)} className="p-2 hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-600 rounded-lg transition-colors" title="Enviar Acceso"><Mail size={18} /></button>
                                            <button onClick={() => handleOpenModal(u)} className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-600 rounded-lg transition-colors" title="Editar Permisos"><Pencil size={18} /></button>
                                            <button onClick={() => setUserToDelete(u.id_usuario)} className="p-2 hover:bg-red-50 dark:hover:bg-slate-700 text-red-600 rounded-lg transition-colors" title="Revocar Acceso"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CREAR / EDITAR ROL V2 */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 shrink-0">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                {editingId ? <Pencil size={20} className="text-blue-600" /> : <UserPlus size={20} className="text-blue-600" />}
                                {editingId ? 'Editar Permisos de Usuario' : 'Asignar Nuevo Rol'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                            
                            {/* SECCIÓN 1: ROL Y CORREO */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-5 rounded-2xl">
                                <h4 className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400 tracking-widest mb-4">1. Identidad y Nivel de Acceso</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nivel de Rol <span className="text-red-500">*</span></label>
                                        <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-blue-700 dark:text-blue-400">
                                            <option value="Administrador">Administrador (Acceso Total)</option>
                                            <option value="Capacitador">Capacitador (Ejecuta Actas)</option>
                                            <option value="Auditor">Auditor (Solo Lectura)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Correo Electrónico <span className="text-red-500">*</span></label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" placeholder="usuario@empresa.com" required />
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 2: DATOS PERSONALES */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">2. Datos del Colaborador</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombres</label>
                                        <input type="text" value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Apellidos</label>
                                        <input type="text" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cargo</label>
                                        <input type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Área</label>
                                        <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN 3: ASIGNACIÓN DE SEDE Y ALCANCE (V2) */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">3. Restricción Operativa (Multitenancy)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Building2 size={12}/> Asignar Sede</label>
                                        <select value={formData.id_sede} onChange={e => setFormData({...formData, id_sede: e.target.value, id_alcance: ''})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
                                            <option value="">-- Acceso a todas las sedes --</option>
                                            {sedes.map(s => <option key={s.id_sede} value={s.id_sede}>{s.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Box size={12}/> Asignar Alcance</label>
                                        <select disabled={!formData.id_sede} value={formData.id_alcance} onChange={e => setFormData({...formData, id_alcance: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm disabled:opacity-50">
                                            <option value="">-- Acceso a todos los alcances --</option>
                                            {alcancesDisponibles.map((a: any) => <option key={a.id_alcance} value={a.id_alcance}>{a.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {formData.id_sede && !formData.id_alcance && (
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> Si dejas el alcance en blanco, el usuario podrá ver todos los alcances de la sede seleccionada.
                                    </p>
                                )}
                            </div>

                            {/* ESTADO (Solo al editar) */}
                            {editingId && (
                                <div className="pt-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Estado del Acceso</label>
                                    <select value={String(formData.estado)} onChange={e => setFormData({...formData, estado: e.target.value === 'true'})} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm">
                                        <option value="true">Activo (Puede iniciar sesión)</option>
                                        <option value="false">Dado de Baja (Acceso revocado)</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-6 flex gap-3 border-t border-gray-100 dark:border-slate-700 shrink-0">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {editingId ? 'Actualizar Permisos' : 'Crear y Enviar Acceso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ELIMINAR */}
            {userToDelete !== null && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">¿Revocar Acceso?</h3>
                            <p className="text-slate-500 text-sm">Esta acción es permanente y el usuario no podrá ingresar al sistema.</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                            <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
                            <button onClick={confirmEliminar} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all active:scale-95">Sí, Revocar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}