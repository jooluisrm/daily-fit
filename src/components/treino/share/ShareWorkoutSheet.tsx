"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Download, Share2, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { ShareWorkoutCard, ShareWorkoutCardProps } from "./ShareWorkoutCard";
import { ShareWorkoutTransparent } from "./ShareWorkoutTransparent";

const LAYOUTS = [
  { id: 'default', name: 'Layout Padrão' },
  { id: 'transparent', name: 'Transparente (PNG)' }
] as const;

const THEMES = [
  { id: 'dark', name: 'Escuro', color: 'bg-zinc-800' },
  { id: 'primary', name: 'Primário', color: 'bg-primary' },
  { id: 'emerald', name: 'Verde', color: 'bg-emerald-500' }
] as const;

export function ShareWorkoutSheet({
  isOpen,
  onOpenChange,
  workoutData
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workoutData: Omit<ShareWorkoutCardProps, 'theme'>
}) {
  const [activeLayout, setActiveLayout] = useState<string>('default');
  const [activeTheme, setActiveTheme] = useState<ShareWorkoutCardProps['theme']>('dark');
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  const handleShare = async (action: 'download' | 'share') => {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, quality: 1.0 });
      
      if (action === 'download') {
        const link = document.createElement("a");
        link.download = `treino-${workoutData.workoutName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      } else {
        if (navigator.share) {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "treino.png", { type: blob.type });
          await navigator.share({
            title: 'Meu Treino no Daily Fit',
            files: [file]
          });
        } else {
          const link = document.createElement("a");
          link.download = `treino-${workoutData.workoutName.replace(/\s+/g, '-').toLowerCase()}.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      console.error("Error generating image", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-zinc-950 border-t border-zinc-800 text-zinc-100 rounded-t-[32px] p-0 h-[96vh] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[100]">
        <SheetHeader className="p-6 pb-2 text-center sm:text-left shrink-0">
          <SheetTitle className="text-white text-2xl font-bold">Compartilhar Conquista</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Personalize sua arte antes de compartilhar.
          </SheetDescription>
        </SheetHeader>

        {/* Carousel Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center bg-black/40 border-y border-zinc-900/50 min-h-[460px]">
           {/* Offscreen element for actual export */}
           <div className="absolute top-0 left-[-15000px]">
             {activeLayout === 'default' && (
               <ShareWorkoutCard ref={exportRef} {...workoutData} theme={activeTheme} />
             )}
             {activeLayout === 'transparent' && (
               <ShareWorkoutTransparent ref={exportRef} {...workoutData} />
             )}
           </div>

           {/* Layouts Carousel */}
           <div 
              className="w-full h-full overflow-x-auto flex snap-x snap-mandatory gap-6 px-[calc(50vw-140px)] sm:px-[calc(50%-140px)] items-center no-scrollbar" 
              style={{ scrollBehavior: 'smooth' }}
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const itemWidth = 280 + 24; 
                const index = Math.round(scrollLeft / itemWidth);
                if (LAYOUTS[index] && activeLayout !== LAYOUTS[index].id) {
                   setActiveLayout(LAYOUTS[index].id);
                }
              }}
            >
             {LAYOUTS.map((layout) => (
                <div key={layout.id} className="snap-center shrink-0 flex flex-col items-center gap-4 py-4">
                  <div 
                    className={`w-[280px] aspect-[800/1250] overflow-hidden rounded-3xl transition-all duration-300 relative ${activeLayout === layout.id ? 'ring-2 ring-primary shadow-2xl shadow-primary/20 scale-100' : 'opacity-40 scale-95'}`}
                    style={layout.id === 'transparent' ? { background: 'repeating-conic-gradient(#3f3f46 0% 25%, #27272a 0% 50%) 50% / 16px 16px' } : {}}
                  >
                    <button 
                      className="absolute inset-0 z-50 cursor-pointer w-full h-full" 
                      onClick={(e) => {
                        e.currentTarget.parentElement?.parentElement?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                        setActiveLayout(layout.id);
                      }} 
                    />
                    <div className="origin-top-left scale-[0.35] pointer-events-none">
                      {layout.id === 'default' && <ShareWorkoutCard {...workoutData} theme={activeTheme} />}
                      {layout.id === 'transparent' && <ShareWorkoutTransparent {...workoutData} />}
                    </div>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeLayout === layout.id ? 'text-primary' : 'text-zinc-600'}`}>
                    {layout.name}
                  </span>
                </div>
             ))}
           </div>
           
           <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
           <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />
        </div>

        {/* Options Area */}
        {activeLayout === 'default' && (
          <div className="p-6 shrink-0 border-b border-zinc-900/50 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Cor de Fundo</p>
            <div className="flex items-center gap-4">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all border ${activeTheme === theme.id ? 'border-primary bg-primary/10 text-white' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full ${theme.color} shadow-sm`} />
                  <span className="text-sm font-medium">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 flex gap-3 shrink-0 pb-8">
          <Button 
            onClick={() => handleShare('download')} 
            disabled={isExporting}
            variant="outline" 
            className="flex-1 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 h-14 sm:h-16 rounded-2xl text-base sm:text-lg font-semibold"
          >
            {isExporting ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" /> : <Download className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />}
            Salvar
          </Button>
          <Button 
            onClick={() => handleShare('share')} 
            disabled={isExporting}
            className="flex-[2] bg-primary text-white hover:bg-primary/90 h-14 sm:h-16 rounded-2xl text-base sm:text-lg font-bold shadow-lg shadow-primary/20"
          >
            {isExporting ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" /> : <Share2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />}
            Compartilhar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
