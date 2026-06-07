// components/LegalModal.tsx
import { X } from 'lucide-react';

interface Props {
    type: 'terminos' | 'privacidad' | null;
    onClose: () => void;
}

export default function LegalModal({ type, onClose }: Props) {
    if (!type) return null;

    const isTerminos = type === 'terminos';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 flex flex-col max-h-[85vh]">

                {/* Cabecera */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">
                        {isTerminos ? 'Términos y Condiciones' : 'Política de Privacidad'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Contenido Scrolleable */}
                <div className="p-6 overflow-y-auto text-sm text-slate-600 space-y-4 leading-relaxed">
                    {isTerminos ? (
                        <>
                            <p><strong>1. Uso del Servicio:</strong> DoSkills provee una plataforma de software como servicio (SaaS) para la gestión de evaluaciones y capacitaciones. El uso de la plataforma está restringido a empresas autorizadas y sus colaboradores.</p>
                            <p><strong>2. Responsabilidad de la Empresa Cliente:</strong> La empresa contratante es la única responsable del contenido de las evaluaciones, preguntas y capacitaciones subidas a la plataforma, así como de la veracidad de los datos de sus trabajadores.</p>
                            <p><strong>3. Disponibilidad:</strong> Nos esforzamos por mantener la plataforma operativa 24/7, pero no nos hacemos responsables por interrupciones debido a mantenimientos programados o causas de fuerza mayor.</p>
                            <p><strong>4. Propiedad Intelectual:</strong> El código, diseño y estructura de DoSkills son propiedad exclusiva de Nos Planét SAC. Se prohíbe su copia, ingeniería inversa o distribución.</p>
                        </>
                    ) : (
                        <>
                            <p><strong>1. Rol de Procesador de Datos:</strong> DoSkills actúa únicamente como procesador de datos. La empresa cliente es la responsable y propietaria de la información de sus trabajadores (Nombres, DNI, resultados).</p>
                            <p><strong>2. Qué datos recopilamos:</strong> Recopilamos información estrictamente necesaria para el funcionamiento de las evaluaciones: credenciales de acceso, datos de identificación del trabajador (proporcionados por su empleador) y un registro de calificaciones.</p>
                            <p><strong>3. Uso de Cookies:</strong> Utilizamos exclusivamente cookies técnicas y de sesión (como tokens de autenticación) necesarias para mantener tu cuenta abierta y segura. No utilizamos cookies de rastreo publicitario ni vendemos datos a terceros.</p>
                            <p><strong>4. Seguridad:</strong> Aplicamos medidas de seguridad estándar de la industria (cifrado de contraseñas, conexiones seguras) para proteger la integridad de los datos almacenados.</p>
                        </>
                    )}
                </div>

                {/* Footer del Modal */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}