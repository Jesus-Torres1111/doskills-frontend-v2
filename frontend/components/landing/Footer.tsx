'use client';

import { useState } from 'react';
import Link from 'next/link';
// Importaciones de redes comentadas temporalmente
import { Mail, Phone /*, Facebook, Twitter, Linkedin, Instagram*/ } from 'lucide-react';
import LegalModal from '@/components/ui/LegalModal';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [legalModalType, setLegalModalType] = useState<'terminos' | 'privacidad' | null>(null);

    return (
        <footer className="bg-gray-900 text-gray-300 py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white mb-4 group cursor-default">
                            <img
                                src="/logo-doskills.svg"
                                alt="DoSkills Logo"
                                className="w-9 h-9 rounded-lg shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105"
                            />
                            <span className="text-xl font-bold tracking-wide">DoSkills</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Transformamos la gestión de cumplimiento y auditoría con tecnología inteligente. Simplificamos tus procesos para que siempre estés listo ante cualquier inspección.
                        </p>

                        {/* 🟢 REDES SOCIALES COMENTADAS POR AHORA */}
                        {/* 
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition-all hover:-translate-y-1"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-all hover:-translate-y-1"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-600 transition-all hover:-translate-y-1"><Linkedin size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-pink-500 transition-all hover:-translate-y-1"><Instagram size={20} /></a>
                        </div>
                        */}
                    </div>

                    {/* enlaces rápidos */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Plataforma</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/login" className="hover:text-blue-400 transition-colors">Iniciar Sesión</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Registro de Capacitaciones</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Validación Biométrica</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Reportes de Seguridad</a></li>
                        </ul>
                    </div>

                    {/* legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <button onClick={() => setLegalModalType('terminos')} className="hover:text-blue-400 transition-colors">
                                    Términos y Condiciones
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setLegalModalType('privacidad')} className="hover:text-blue-400 transition-colors">
                                    Política de Privacidad
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* contacto */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Contacto</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-blue-500 shrink-0" />
                                <span>+51 934 587 377</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-blue-500 shrink-0" />
                                <span>support@nosplanet.org</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* barra inferior */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {currentYear} DoSkills. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <span>Desarrollado con ❤️ por el equipo de DoSkills</span>
                    </div>
                </div>
            </div>

            <LegalModal
                type={legalModalType}
                onClose={() => setLegalModalType(null)}
            />
        </footer>
    );
}