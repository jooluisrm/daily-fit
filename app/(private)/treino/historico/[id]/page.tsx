import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DetalhesTreino } from "@/src/components/treino/historico/DetalhesTreino";

export const metadata = {
  title: "Detalhes do Treino | Daily Fit",
};

export default async function DetalhesTreinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto w-full pt-8 md:pt-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/treino/historico"
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Resumo do Treino</h1>
          <p className="text-sm text-zinc-400">
            Confira o que foi feito neste dia.
          </p>
        </div>
      </div>

      <DetalhesTreino workoutId={id} />
    </div>
  );
}
