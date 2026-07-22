import { HistoricoList } from "@/src/components/treino/historico/HistoricoList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Histórico de Treinos | Daily Fit",
};

export default function HistoricoPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/treino"
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Histórico de Treinos</h1>
          <p className="text-sm text-zinc-400">
            Acompanhe todos os seus treinos realizados.
          </p>
        </div>
      </div>

      <HistoricoList />
    </div>
  );
}
