
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, User, CheckCircle2, ChevronRight, ArrowLeft, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

// --- MOCK CIIU REV 4 (Reducido para el ejemplo) ---
const CIIU_DATA: Record<string, any> = {
    "A": {
        nombre: "Agricultura, ganadería, silvicultura y pesca",
        divisiones: {
            "01": {
                nombre: "Agricultura, ganadería, caza y actividades conexas",
                grupos: {
                    "0111": "Cultivo de cereales, legumbres y semillas oleaginosas",
                    "0150": "Cultivo en áreas mixtas (agrícola y ganadera)"
                }
            },
            "02": {
                nombre: "Silvicultura y extracción de madera",
                grupos: {
                    "0210": "Silvicultura y otras actividades forestales"
                }
            }
        }
    },
    "C": {
        nombre: "Industrias manufactureras",
        divisiones: {
            "10": {
                nombre: "Elaboración de productos alimenticios",
                grupos: {
                    "1030": "Elaboración y conservación de frutas, legumbres y hortalizas"
                }
            }
        }
    }
};

export default function RegistroPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // --- ESTADO DEL FORMULARIO ---
    const [formData, setFormData] = useState({
        ruc: '',
        razonSocial: '',
        numSedes: '',
        ciiuSeccion: '',
        ciiuDivision: '',
        ciiuActividad: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        cargo: '',
        correo: '',
        celular: ''
    });

    const [confirmado, setConfirmado] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

    // --- BORRADOR AUTOMÁTICO (LocalStorage) ---
    useEffect(() => {
        const draft = localStorage.getItem('doskills_registro_draft');
        if (draft) {
            setFormData(JSON.parse(draft));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('doskills_registro_draft', JSON.stringify(formData));
    }, [formData]);

    // --- MANEJADORES DE CAMBIO ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'ruc') {
            const onlyNums = value.replace(/\D/g, '');
            if (onlyNums.length <= 11) setFormData({ ...formData, [name]: onlyNums });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCiiuSeccion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, ciiuSeccion: e.target.value, ciiuDivision: '', ciiuActividad: '' });
    };

    const handleCiiuDivision = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, ciiuDivision: e.target.value, ciiuActividad: '' });
    };

    // --- VALIDACIONES POR PASO ---
    const nextStep = () => {
        if (step === 1) {
            if (formData.ruc.length !== 11) return toast.error("El RUC debe tener 11 dígitos");
            if (!formData.razonSocial || !formData.numSedes || !formData.ciiuActividad) return toast.error("Completa todos los campos obligatorios");
            setStep(2);
        } else if (step === 2) {
            if (!formData.nombres || !formData.apellidoPaterno || !formData.apellidoMaterno || !formData.cargo || !formData.correo || !formData.celular) {
                return toast.error("Completa los datos del administrador");
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) return toast.error("Correo corporativo inválido");
            setStep(3);
        }
    };

    // --- INTEGRACIÓN AL BACKEND (SIMULADA HASTA QUE RESPONDAN) ---
    const handleGenerarCodigo = async () => {
        if (!confirmado) return toast.error("Debes confirmar que los datos son correctos");
        setIsLoading(true);
        try {
            // Intento de conexión al backend
            await api.post('/auth/registro-publico', formData);
            toast.success("Código enviado a tu correo");
            setStep(4);
        } catch (error) {
            // BYPASS PARA EL EQUIPO FRONTEND: Avanza a la UI del OTP aunque el endpoint no exista aún
            toast.info("Aviso: El Backend aún no soporta esta ruta. Avanzando al OTP para demo visual.");
            setTimeout(() => {
                setStep(4);
                setIsLoading(false);
            }, 1500);
        }
    };

    const handleValidarOTP = () => {
        const codigoCompleto = otp.join('');
        if (codigoCompleto.length < 4) return toast.error("Ingresa el código de 4 dígitos");
        setIsLoading(true);
        
        // Simulación de validación
        setTimeout(() => {
            setIsLoading(false);
            setStep(5); // Pantalla de éxito
            localStorage.removeItem('doskills_registro_draft');
        }, 1500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value !== '' && index < 3) otpRefs[index + 1].current?.focus();
    };

    // --- RENDERIZADO DEL STEPPER (UI) ---
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A1128] flex flex-col items-center py-12 px-4 transition-colors">
            
            {/* Header / Nav */}
            <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors">
                    <ArrowLeft size={18} /> Volver al inicio
                </Link>
                <div className="flex items-center gap-2">
                    <img src="/logo-doskills.svg" alt="DoSkills" className="w-8 h-8 rounded-lg shadow-sm" />
                    <span className="font-extrabold text-xl text-slate-900 dark:text-white">DoSkills</span>
                </div>
            </div>

            {/* Tarjeta Principal */}
            <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                
                {/* Cabecera del Stepper (Solo visible en pasos 1, 2 y 3) */}
                {step <= 3 && (
                    <div className="bg-gray-50/50 dark:bg-gray-900/50 px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full"></div>
                            
                            {[1, 2, 3].map((num, i) => (
                                <div key={num} className="flex flex-col items-center gap-2 bg-gray-50/50 dark:bg-gray-900/50 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                                        step > num ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                        step === num ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                                        'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'
                                    }`}>
                                        {step > num ? <CheckCircle2 size={20} /> : num}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= num ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                        {num === 1 ? 'Tu Empresa' : num === 2 ? 'Administrador' : 'Confirmación'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CONTENIDO DINÁMICO */}
                <div className="p-8 md:p-12">
                    
                    {/* PASO 1: TU EMPRESA */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                                <Building2 className="text-blue-600" /> Datos de la Organización
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Ingresa la información legal para estructurar tu cuenta.</p>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">RUC <span className="text-red-500">*</span></label>
                                        <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} placeholder="11 dígitos" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Razón Social <span className="text-red-500">*</span></label>
                                        <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} placeholder="Ej: Agrícola San Juan S.A.C." className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Número de Sedes <span className="text-red-500">*</span></label>
                                    <select name="numSedes" value={formData.numSedes} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white appearance-none">
                                        <option value="">-- Seleccionar --</option>
                                        <option value="1">1 Sede (Sede Única)</option>
                                        <option value="2-5">2 a 5 Sedes</option>
                                        <option value="mas_5">Más de 5 Sedes</option>
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1.5 italic">Podrás configurar las ubicaciones de tus sedes más adelante.</p>
                                </div>

                                {/* AUTOCOMPLETADO CIIU REV 4 */}
                                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl space-y-4">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">Actividad Económica (CIIU Rev. 4)</h4>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">1. Sección</label>
                                        <select value={formData.ciiuSeccion} onChange={handleCiiuSeccion} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
                                            <option value="">-- Elige una sección --</option>
                                            {Object.keys(CIIU_DATA).map(key => (
                                                <option key={key} value={key}>{key} - {CIIU_DATA[key].nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {formData.ciiuSeccion && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">2. División</label>
                                            <select value={formData.ciiuDivision} onChange={handleCiiuDivision} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white">
                                                <option value="">-- Elige una división --</option>
                                                {Object.keys(CIIU_DATA[formData.ciiuSeccion].divisiones).map(div => (
                                                    <option key={div} value={div}>{div} - {CIIU_DATA[formData.ciiuSeccion].divisiones[div].nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.ciiuDivision && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">3. Actividad Principal <span className="text-red-500">*</span></label>
                                            <select name="ciiuActividad" value={formData.ciiuActividad} onChange={handleChange} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none dark:text-white font-bold text-blue-700 dark:text-blue-400">
                                                <option value="">-- Elige el grupo final --</option>
                                                {Object.keys(CIIU_DATA[formData.ciiuSeccion].divisiones[formData.ciiuDivision].grupos).map(grp => (
                                                    <option key={grp} value={grp}>{grp} - {CIIU_DATA[formData.ciiuSeccion].divisiones[formData.ciiuDivision].grupos[grp]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20">
                                    Siguiente Paso <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: ADMINISTRADOR */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <User className="text-blue-600" /> Administrador del Sistema
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Este será el usuario con acceso total a la plataforma.</p>
                                </div>
                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg">Acceso Principal</span>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Nombres <span className="text-red-500">*</span></label>
                                        <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ap. Paterno <span className="text-red-500">*</span></label>
                                        <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ap. Materno <span className="text-red-500">*</span></label>
                                        <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Cargo <span className="text-red-500">*</span></label>
                                        <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Jefe de SST" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Celular <span className="text-red-500">*</span></label>
                                        <div className="flex">
                                            <span className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-800 border-r-0 rounded-l-xl px-3 py-3 text-sm font-medium text-gray-500">+51</span>
                                            <input type="tel" name="celular" value={formData.celular} onChange={handleChange} placeholder="987 654 321" className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-r-xl px-4 py-3 outline-none focus:border-blue-500 transition-all dark:text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Correo Corporativo <span className="text-red-500">*</span></label>
                                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="admin@empresa.com" className="w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-100 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-semibold" />
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">A este correo enviaremos el código de activación de 4 dígitos.</p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button onClick={() => setStep(1)} className="px-6 py-3.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors">Atrás</button>
                                <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-500/20">
                                    Resumen Final <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 3: CONFIRMACIÓN */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Verifica tu información</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 relative group">
                                    <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                                    <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-4">1. Tu Empresa</h4>
                                    <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">{formData.razonSocial}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">RUC: {formData.ruc}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">CIIU: {formData.ciiuActividad}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 relative group">
                                    <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Editar</button>
                                    <h4 className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-4">2. Administrador</h4>
                                    <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">{formData.nombres} {formData.apellidoPaterno}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{formData.cargo}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">{formData.correo}</p>
                                </div>
                            </div>

                            <label className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 cursor-pointer mb-8">
                                <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} className="mt-1 w-5 h-5 accent-blue-600" />
                                <span className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-relaxed">
                                    Confirmo que los datos son correctos y tengo autorización de mi empresa para crear esta cuenta. Acepto recibir el código de validación.
                                </span>
                            </label>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(2)} className="px-6 py-3.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-colors">Atrás</button>
                                <button onClick={handleGenerarCodigo} disabled={isLoading || !confirmado} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />} 
                                    Generar código de prueba
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PASO 4: VERIFICACIÓN OTP */}
                    {step === 4 && (
                        <div className="animate-in zoom-in-95 duration-500 text-center py-6">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 mx-auto rounded-full flex items-center justify-center mb-6">
                                <Mail size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Ingresa el código de verificación</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Hemos enviado un código de 4 dígitos a <b className="text-gray-800 dark:text-gray-200">{formData.correo}</b></p>
                            
                            <div className="flex justify-center gap-4 mb-8">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={otpRefs[index]}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        className="w-16 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
                                    />
                                ))}
                            </div>

                            <button onClick={handleValidarOTP} disabled={isLoading} className="w-full max-w-sm mx-auto bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Validar Código'}
                            </button>
                            
                            <button className="mt-6 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">Volver a enviar el código</button>
                        </div>
                    )}

                    {/* PASO 5: ÉXITO */}
                    {step === 5 && (
                        <div className="animate-in zoom-in-95 duration-500 text-center py-6">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CheckCircle2 size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">¡Registro exitoso!</h2>
                            <div className="inline-flex bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-6 border border-blue-200 dark:border-blue-900/50">
                                Prueba simulada · 15 días activos
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Tu cuenta para <b>{formData.razonSocial}</b> ha sido activada. Tu usuario administrador es tu correo: <b>{formData.correo}</b>.
                            </p>
                            
                            <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-6 rounded-2xl max-w-md mx-auto mb-8 text-left">
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Siguientes pasos</p>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 font-medium">
                                    <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-emerald-500" /> Cuenta verificada</li>
                                    <li className="flex gap-2 items-center text-blue-600 dark:text-blue-400"><ChevronRight size={14} /> Configurar Sedes y Alcances</li>
                                    <li className="flex gap-2 items-center text-gray-400"><ChevronRight size={14} /> Importar listado de Trabajadores</li>
                                </ul>
                            </div>

                            <Link href="/dashboard" className="inline-flex bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black tracking-wide shadow-2xl hover:scale-105 transition-all">
                                IR AL PANEL DE CONTROL
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}