const fs = require('fs');
const path = './src/components/treino/treino-focus-view.tsx';
let content = fs.readFileSync(path, 'utf8');
const startIdx = content.indexOf('{hasUncompletedPreviousSets ? (');
const endIdx = content.indexOf('<TreinoHistoryDialog');
const before = content.slice(0, startIdx);
const after = content.slice(endIdx);
const cleanBlock = `{hasUncompletedPreviousSets ? (
                <Button
                  onClick={() => {
                    for (let s = 1; s < currentSet; s++) {
                      if (!checkIsSetCompleted(currentIndex, s)) {
                        setCurrentSet(s)
                        break
                      }
                    }
                  }}
                  className="w-full h-16 text-[14px] uppercase tracking-[0.1em] font-black rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-[0_10px_30px_-10px_rgba(217,119,6,0.6)]"
                >
                  <AlertTriangle className="w-5 h-5 mr-3" />
                  Série anterior pendente
                </Button>
              ) : isHistoryMode ? (
                hasUnsavedChanges ? (
                  <Button
                    onClick={handleSave}
                    disabled={!weightInput || !repsInput || isSaving}
                    className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-zinc-900 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                      Atualizar Série
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={goToPendingSet}
                    className="w-full h-16 text-[15px] uppercase tracking-[0.1em] font-black rounded-2xl bg-zinc-900 border-2 border-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 shadow-none transition-all duration-300"
                  >
                    <span className="flex items-center justify-center">
                      <SkipForward className="w-5 h-5 mr-3" />
                      Voltar ao fluxo
                    </span>
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={!weightInput || !repsInput || isSaving}
                  className="w-full h-16 text-[15px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 relative overflow-hidden group bg-primary text-primary-foreground hover:brightness-110 shadow-[0_10px_40px_-10px_rgba(var(--primary),0.8)] hover:shadow-[0_15px_50px_-10px_rgba(var(--primary),0.9)] hover:-translate-y-1 border border-primary/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-12 group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <span className="relative z-10 flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                    Salvar Série
                  </span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900/50 backdrop-blur-md">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-zinc-800" />
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-primary transition-all duration-1000 ease-linear" strokeDasharray="553" strokeDashoffset={553 - (553 * Math.min(restTimeLeft, restTimeGoal)) / restTimeGoal} strokeLinecap="round" transform="rotate(-90 96 96)" />
              </svg>
              <span className="text-5xl font-mono font-bold text-white mb-2">{formatTime(restTimeLeft)}</span>
              <span className="text-zinc-400 text-sm uppercase tracking-widest font-semibold">Descanso</span>
            </div>
            <div className="flex gap-4 mt-10 w-full max-w-xs">
              <Button variant="outline" onClick={() => addTime(30)} className="flex-1 h-12 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">+30s</Button>
              <Button variant="outline" onClick={() => addTime(-30)} className="flex-1 h-12 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">-30s</Button>
            </div>
            <Button variant={restTimeLeft === 0 ? "default" : "ghost"} onClick={handleRestFinished} className={cn("mt-6 transition-all duration-300", restTimeLeft === 0 ? "w-full h-14 bg-primary text-white hover:bg-primary/90 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)] animate-in slide-in-from-bottom-2" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50")}>
              {restTimeLeft === 0 ? <><CheckCircle2 className="w-5 h-5 mr-2" />Continuar Treino</> : <><SkipForward className="w-4 h-4 mr-2" />Pular Descanso</>}
            </Button>
          </div>
        )}
      </div>
    </div>

    {/* Navigation Footer */}
    <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex justify-between items-center z-10 relative">
      <Button variant="secondary" onClick={() => {
        let nextI = currentIndex
        let nextS = currentSet
        if (currentSet > 1) { nextS = currentSet - 1 } else if (currentIndex > 0) { nextI = currentIndex - 1; nextS = activeExercises[currentIndex - 1].sets } else { return }
        if (checkIsSetCompleted(nextI, nextS)) { setCurrentIndex(nextI); setCurrentSet(nextS); setIsViewingHistory(true) } else { setCurrentIndex(nextI); setCurrentSet(nextS); setIsViewingHistory(false) }
      }} disabled={currentIndex === 0 && currentSet === 1} className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl px-5 h-12">
        <ChevronLeft className="w-5 h-5 mr-2 text-zinc-500" />Anterior
      </Button>
      <Button variant="secondary" onClick={advanceToNextSet} className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl px-5 h-12">
        Pular<ChevronRight className="w-5 h-5 ml-2 text-zinc-500" />
      </Button>
    </div>

    `;
fs.writeFileSync(path, before + cleanBlock + after, 'utf8');
console.log('Rebuilt Block');
