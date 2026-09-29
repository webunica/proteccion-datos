'use client';

import { Printer } from 'lucide-react';

export function PrintTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      Imprimir / Guardar como PDF
    </button>
  );
}
