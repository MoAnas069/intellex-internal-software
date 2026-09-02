'use client';

import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Search } from 'lucide-react';
import { useState } from 'react';

export default function ClientsPage() {
  const router = useRouter();
  const { isOwner } = useAuth();
  const { clients } = useData();
  const [search, setSearch] = useState('');

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      <div>
        <h1 className="text-xl font-bold">Clients</h1>
        <p className="text-sm text-ix-text-muted">{filtered.length} client organizations</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ix-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-ix-surface border border-ix-border text-sm placeholder:text-ix-text-muted focus:border-ix-green focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((client) => (
          <div key={client.id} className="rounded-2xl border border-ix-border bg-ix-surface p-4 hover:bg-ix-surface-hover transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ix-bg border border-ix-border flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-ix-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{client.company || client.name}</h3>
                <p className="text-xs text-ix-text-muted mt-0.5 truncate">
                  {client.name} • {client.projectCount} project{client.projectCount > 1 ? 's' : ''}
                </p>
                {isOwner && (
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-ix-text-secondary font-medium">
                      Total: {formatCurrency(client.totalValue)}
                    </span>
                    {client.pendingPayment > 0 ? (
                      <span className="text-xs text-amber-400 font-semibold">
                        Pending: {formatCurrency(client.pendingPayment)}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-ix-green-dim text-ix-green border border-ix-green/20">
                        Paid in Full
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ix-text-muted">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
