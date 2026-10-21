'use client';

import Link from 'next/link';
import { ArrowRight, PlayCircle, Shield, Lock, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function Hero() {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!usuario || !contrasena) {
            toast.error("Por favor, ingresa tu usuario y contraseña");
            return;
        }
        setIsLoading(true);
        try {
            await login(usuario, contrasena);
        } catch (error: any) {
            toast.error(error.response?.data?.error || String(error) || "Error al iniciar sesión");
            setIsLoading(false);
        }
    };

    return (
        <div id="inicio" className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-[#0A1128]">
            {/* Fondo azul marino sólido con gradiente sutil como en la captura */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#050A1F] via-[#0A1128] to-[#0D1838]"></div>

            <div className="max-w-[1400px] w-full mx-auto px-6 sm:px-8 lg:px-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* COLUMNA IZQUIERDA: Propuesta de Valor V2 */}
                    <div className="lg:col-span-7 text-left animate-in fade-in slide-in-from-left-8 duration-700 pr-0 lg:pr-10">
                        {/* Píldora superior */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A2649] text-[#60A5FA] text-[11px] font-bold mb-8 border border-[#2A3B69] uppercase tracking-widest">
                            <Shield size={14} className="text-[#60A5FA]" /> Menos gestión. Más crecimiento.
                        </div>
                        
                        {/* Título principal */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                            Aprende. Conecta.<br />
                            <span className="text-[#3B82F6]">Evoluciona.</span>
                        </h1>
                        
                        {/* Párrafo descriptivo */}
                        <p className="mt-6 text-[17px] text-[#94A3B8] mb-10 leading-relaxed max-w-xl font-medium">
                            De la formación al cumplimiento. De los datos a la acción. Centraliza tu gestión de SST con evidencias verificables en tiempo real.
                        </p>

                        {/* Píldoras de beneficios inferiores */}
                        <div className="flex flex-wrap gap-4">
                            <span className="flex items-center gap-2 text-sm text-[#94A3B8] bg-[#131C3B] border border-[#1E293B] px-5 py-2.5 rounded-xl font-medium">
                                <CheckCircle2 size={18} className="text-[#10B981]" /> Plan de capacitación
                            </span>
                            <span className="flex items-center gap-2 text-sm text-[#94A3B8] bg-[#131C3B] border border-[#1E293B] px-5 py-2.5 rounded-xl font-medium">
                                <CheckCircle2 size={18} className="text-[#10B981]" /> Evidencias conectadas
                            </span>
                            <span className="flex items-center gap-2 text-sm text-[#94A3B8] bg-[#131C3B] border border-[#1E293B] px-5 py-2.5 rounded-xl font-medium">
                                <CheckCircle2 size={18} className="text-[#10B981]" /> Brechas visibles
                            </span>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Tarjeta de Acceso V2 Blanca */}
                    <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 flex justify-end">
                        <div className="bg-white rounded-3xl p-10 shadow-2xl w-full max-w-[480px] relative">
                            {/* Insignia Prueba azul brillante */}
                            <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-bl-xl rounded-tr-3xl shadow-sm">
                                Prueba de 15 días · Sin suscripción
                            </div>

                            <div className="mb-8 mt-6 text-center">
                                <h2 className="text-3xl font-extrabold text-[#111827] mb-3">Bienvenido a DoSkills</h2>
                                <p className="text-[13px] text-[#6B7280] font-medium leading-relaxed px-4">
                                    Automatiza tus capacitaciones y reduce costos en tu organización.
                                </p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-widest mb-2">Usuario o Correo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                        <input 
                                            type="text" 
                                            value={usuario}
                                            onChange={(e) => setUsuario(e.target.value)}
                                            className="w-full bg-white border border-[#E5E7EB] rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#111827] placeholder:text-[#9CA3AF]"
                                            placeholder="Ingresa tu usuario"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Contraseña</label>
                                        <Link href="/recuperar" className="text-[11px] font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">¿Olvidaste tu contraseña?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                        <input 
                                            type="password" 
                                            value={contrasena}
                                            onChange={(e) => setContrasena(e.target.value)}
                                            className="w-full bg-white border border-[#E5E7EB] rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#111827] placeholder:text-[#9CA3AF]"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl py-4 font-bold transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 mt-2"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar sesión'}
                                </button>
                            </form>

                            <div className="mt-5 flex flex-col gap-4">
                                <Link href="/registro" className="w-full flex items-center justify-center gap-2 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#111827] rounded-2xl py-4 font-bold border border-[#E5E7EB] transition-all active:scale-95">
                                    Regístrate <ArrowRight size={18} />
                                </Link>
                                <button className="w-full flex items-center justify-center gap-2 text-[#6B7280] hover:text-[#374151] py-2 font-bold text-[13px] transition-colors">
                                    <PlayCircle size={18} /> Ver demo
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}