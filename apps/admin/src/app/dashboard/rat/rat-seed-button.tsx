'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Loader2 } from 'lucide-react';

interface RatSeedButtonProps {
  tenantId?: string | null;
  className?: string;
  label?: string;
}

export function RatSeedButton({ tenantId, className, label }: RatSeedButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      const res = await fetch('/api/rat/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId }),
      });

      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } catch (e) {
      console.error('Error al inicializar RAT:', e);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
        <Check className="w-4 h-4 text-emerald-600" />
        Tratamientos cargados
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSeed}
      disabled={loading}
      className={
        className ||
        'inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer'
      }
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Cargando 8 tratamientos...
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          {label || 'Cargar 8 Tratamientos Estándar'}
        </>
      )}
    </button>
  );
}
