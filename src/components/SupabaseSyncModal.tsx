import React, { useState } from 'react';
import { isSupabaseConfigured, supabaseService } from '../lib/supabase.ts';
import { AlertCircle, CheckCircle, Database, Key, RefreshCw, X } from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const [testResult, setTestResult] = useState<{ loading: boolean; message: string | null; success?: boolean }>({
    loading: false,
    message: null,
  });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestResult({ loading: true, message: 'Testando conexão com Supabase...' });
    const result = await supabaseService.testConnection();
    setTestResult({ loading: false, message: result.message, success: result.success });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <section className="bg-[#0f0f12] border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white">Integração com Supabase</h2>
              <span className="text-xs text-[#3ECF8E]">
                {isSupabaseConfigured ? 'Variáveis de ambiente configuradas' : 'Configuração incompleta'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#121214] hover:bg-[#1c1c21] text-[#a1a1aa] hover:text-white flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="space-y-4 text-sm leading-relaxed text-[#a1a1aa]">
          <p>
            As credenciais são lidas somente de <code className="text-white">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-white">VITE_SUPABASE_ANON_KEY</code>. Configure-as no arquivo de ambiente local;
            este modal não armazena chaves no navegador.
          </p>
          <div className="rounded-2xl border border-white/5 bg-[#121214] p-4 flex gap-3">
            <Key className="w-4 h-4 shrink-0 text-[#3ECF8E] mt-0.5" />
            <p>
              O esquema e as políticas RLS já foram aplicados. Não é necessário executar migrations novamente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testResult.loading || !isSupabaseConfigured}
          className="w-full px-4 py-3 rounded-xl bg-[#1c1c21] hover:bg-[#2d3449] disabled:opacity-50 text-xs font-semibold text-[#e8ffef] flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testResult.loading ? 'animate-spin' : ''}`} />
          <span>Testar conexão</span>
        </button>

        {testResult.message && (
          <div
            role="status"
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-[#172617] border-[#3ECF8E]/40 text-[#3ECF8E]'
                : 'bg-[#93000a]/20 border-[#ffb4ab]/30 text-[#ffb4ab]'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </section>
    </div>
  );
};
