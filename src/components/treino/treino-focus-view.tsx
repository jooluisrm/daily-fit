"use client"

import { useState, useEffect, useMemo } from "react"
import { Dumbbell, CheckCircle2, ChevronLeft, ChevronRight, Minimize2, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogExercise } from "@/src/hooks/use-exercise"
import { useLogCardio } from "@/src/hooks/use-cardio"
import { useUpdateWorkoutStatus } from "@/src/hooks/use-workout-log"
import { useTimerStore } from "@/src/store/use-timer-store"
import { cn } from "@/lib/utils"
import { TreinoHistoryDialog } from "./treino-history-dialog"
import { SwipeIndicator } from "./focus-view/swipe-indicator"
import { TreinoSummaryDialog } from "./treino-summary-dialog"
import { useSession } from "next-auth/react"
import { requestNotificationPermission } from "@/src/lib/notifications"
import { useWorkoutProgressStore } from "@/src/store/use-workout-progress-store"
import { AnimatePresence, motion } from "framer-motion"

import { checkIsSetCompleted, findNextPendingSet } from "./focus-view/utils/workout-utils"
import { PendingPrompt } from "./focus-view/pending-prompt"
import { CardioPrompt } from "./focus-view/cardio-prompt"
import { CardioActive } from "./focus-view/cardio-active"
import { TopBar } from "./focus-view/top-bar"
import { RestView } from "./focus-view/rest-view"
import { ActiveSetView } from "./focus-view/active-set-view"

interface TreinoFocusViewProps {
  workoutId: string
  exercises: any[]
  onFinishAll: () => void
  onClose: () => void
}

export function TreinoFocusView({ workoutId, exercises, onFinishAll, onClose }: TreinoFocusViewProps) {
  const { data: session } = useSession()
  const user = session?.user as any
  const restTimeGoal = user?.restTimeGoal || 90

  const activeExercises = useMemo(() => exercises.filter((ex) => ex.isActive), [exercises])

  const { setProgress } = useWorkoutProgressStore()
  const todayStr = useMemo(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }), [])

  const [hasInitialized, setHasInitialized] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [direction, setDirection] = useState(1) // 1 para ir pra frente, -1 para voltar

  // Initialize from localStorage directly to bypass any Zustand hydration delays
  useEffect(() => {
    if (!hasInitialized) {
      try {
        const raw = localStorage.getItem('daily-fit-workout-progress')
        if (raw) {
          const parsed = JSON.parse(raw)
          const state = parsed.state
          if (state && state.workoutId === workoutId && state.date === todayStr) {
            setCurrentIndex(state.currentIndex || 0)
            setCurrentSet(state.currentSet || 1)
          }
        }
      } catch (e) {
        console.error("Failed to parse workout progress", e)
      }
      setHasInitialized(true)
    }
  }, [workoutId, todayStr, hasInitialized])

  // Sync back to store
  useEffect(() => {
    if (hasInitialized) {
      setProgress(workoutId, todayStr, currentIndex, currentSet)
    }
  }, [currentIndex, currentSet, workoutId, todayStr, setProgress, hasInitialized])

  const [weightInput, setWeightInput] = useState("")
  const [repsInput, setRepsInput] = useState("")

  // Cardio Integration States
  const [wantsCardio, setWantsCardio] = useState(false)
  const [cardioType, setCardioType] = useState('Esteira')
  const [cardioIntensity, setCardioIntensity] = useState('moderado')
  const [cardioTime, setCardioTime] = useState('')

  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [autoAdvanceTimeLeft, setAutoAdvanceTimeLeft] = useState(10)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)
  const [isSwipeLocked, setIsSwipeLocked] = useState(false)
  const [shakeLock, setShakeLock] = useState(false)

  const { isResting, restTimeLeft, startTimer, stopTimer, addTime } = useTimerStore()

  const { mutateAsync: logExercise, isPending: isSaving } = useLogExercise(workoutId)
  const { mutateAsync: logCardio, isPending: isSavingCardio } = useLogCardio()
  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkoutStatus(workoutId)

  // Wrapper local para checkIsSetCompleted
  const localCheckIsSetCompleted = (exerciseIndex: number, setNum: number) => {
    return checkIsSetCompleted(activeExercises, exerciseIndex, setNum, todayStr)
  }

  const isRestFinished = isResting && restTimeLeft === 0;

  const pendingExercisesList = useMemo(() => {
    return activeExercises.map((ex, index) => {
      const pendingSets: number[] = []
      for (let s = 1; s <= ex.sets; s++) {
        if (!localCheckIsSetCompleted(index, s)) {
          pendingSets.push(s)
        }
      }
      return { ex, index, pendingSets }
    }).filter(item => item.pendingSets.length > 0)
  }, [activeExercises, todayStr])

  const steps = useMemo(() => {
    const s: any[] = []
    activeExercises.forEach(ex => s.push({ type: 'EXERCISE', ex }))
    if (pendingExercisesList.length > 0) {
      s.push({ type: 'PENDING' })
    }
    s.push({ type: 'COMPLETED' })
    if (wantsCardio) {
      s.push({ type: 'CARDIO' })
    }
    return s
  }, [activeExercises, pendingExercisesList, wantsCardio])

  useEffect(() => {
    if (currentIndex >= steps.length) {
      setCurrentIndex(steps.length - 1)
    }
  }, [steps.length, currentIndex])

  useEffect(() => {
    const cardioIdx = steps.findIndex(s => s.type === 'CARDIO')
    if (wantsCardio && cardioIdx !== -1 && currentIndex < cardioIdx) {
      setWantsCardio(false)
    }
  }, [currentIndex, wantsCardio, steps])

  const goToPendingSet = () => {
    if (activeExercises.length === 0) return

    if (!isViewingHistory && !localCheckIsSetCompleted(currentIndex, currentSet)) {
      return
    }

    const next = findNextPendingSet(activeExercises, currentIndex, currentSet, todayStr)
    setDirection(1)
    if (next) {
      setCurrentIndex(next.index)
      setCurrentSet(next.set)
      setIsViewingHistory(false)
    } else {
      setCurrentIndex(activeExercises.length - 1)
      setCurrentSet(activeExercises[activeExercises.length - 1].sets)
      setIsViewingHistory(true)
    }
  }

  useEffect(() => {
    if (hasInitialized && activeExercises.length > 0) {
      if (!isViewingHistory && localCheckIsSetCompleted(currentIndex, currentSet)) {
        goToPendingSet()
      }
    }
  }, [activeExercises, currentIndex, currentSet, isViewingHistory, hasInitialized])

  const currentStep = steps[currentIndex] || steps[0]
  const currentExercise = currentStep.type === 'EXERCISE' ? currentStep.ex : null

  const historyLog = useMemo(() => {
    if (!currentExercise) return null
    const logs = currentExercise.logs?.filter((l: any) => {
      if (l.setNumber !== currentSet) return false
      const logDateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDateStr !== todayStr
    }) || []

    logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return logs.length > 0 ? logs[0] : null
  }, [currentExercise, currentSet, todayStr])

  const fullHistory = useMemo(() => {
    if (!currentExercise || !currentExercise.logs) return []

    const logs = currentExercise.logs.filter((l: any) => {
      const logDateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDateStr !== todayStr
    })

    const grouped: Record<string, any[]> = {}
    logs.forEach((l: any) => {
      const dateStr = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      if (!grouped[dateStr]) grouped[dateStr] = []
      grouped[dateStr].push(l)
    })

    const sortedDates = Object.keys(grouped).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/')
      const [dayB, monthB, yearB] = b.split('/')
      return new Date(Number(yearB), Number(monthB) - 1, Number(dayB)).getTime() - new Date(Number(yearA), Number(monthA) - 1, Number(dayA)).getTime()
    })

    return sortedDates.map(date => ({
      date,
      logs: grouped[date].sort((a: any, b: any) => a.setNumber - b.setNumber)
    }))
  }, [currentExercise, todayStr])

  useEffect(() => {
    if (!currentExercise) return

    const todayLog = currentExercise.logs?.find((l: any) => {
      const logDate = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return l.setNumber === currentSet && logDate === todayStr
    })

    const isPerSide = currentExercise.weightType === 'PER_SIDE'

    if (todayLog) {
      setWeightInput(String(isPerSide ? todayLog.weight / 2 : todayLog.weight))
      setRepsInput(String(todayLog.repsDone))
      return
    }

    if (currentSet > 1) {
      const prevSetTodayLog = currentExercise.logs?.find((l: any) => {
        const logDate = new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        return l.setNumber === currentSet - 1 && logDate === todayStr
      })

      if (prevSetTodayLog) {
        setWeightInput(String(isPerSide ? prevSetTodayLog.weight / 2 : prevSetTodayLog.weight))
        setRepsInput(String(prevSetTodayLog.repsDone))
        return
      }
    }

    const setLogs = currentExercise.logs?.filter((l: any) => l.setNumber === currentSet) || []
    const sortedSetLogs = [...setLogs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (sortedSetLogs.length > 0) {
      setWeightInput(String(isPerSide ? sortedSetLogs[0].weight / 2 : sortedSetLogs[0].weight))
      setRepsInput(String(sortedSetLogs[0].repsDone))
    } else {
      setWeightInput("")
      setRepsInput("")
    }
  }, [currentIndex, currentSet, currentExercise, todayStr])

  useEffect(() => {
    if (!isResting || restTimeLeft > 0) {
      setAutoAdvanceTimeLeft(10)
    }
  }, [isResting, restTimeLeft])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isResting && restTimeLeft <= 0) {
      if (autoAdvanceTimeLeft > 0) {
        timeout = setTimeout(() => {
          setAutoAdvanceTimeLeft(prev => prev - 1)
        }, 1000)
      } else {
        handleRestFinished()
      }
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [isResting, restTimeLeft, autoAdvanceTimeLeft])

  const handleRestFinished = () => {
    stopTimer()
    goToPendingSet()
  }

  const advanceToNextSet = () => {
    setDirection(1)
    if (currentStep.type === 'EXERCISE' && currentExercise && currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1)
    } else {
      if (currentIndex < steps.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setCurrentSet(1)
      }
    }
  }

  const handleSkipCardio = async () => {
    try {
      await updateStatus({ status: 'COMPLETED', hasCardio: false })
      onFinishAll()
    } catch (error) {
      console.error("Erro ao finalizar treino.", error)
    }
  }

  const handleFinishCardio = async () => {
    try {
      await logCardio({
        workoutId,
        type: cardioType,
        intensity: cardioIntensity,
        duration: Number(cardioTime)
      })
      await updateStatus({ status: 'COMPLETED', hasCardio: true })
      onFinishAll()
    } catch (error) {
      console.error("Erro ao salvar cardio.", error)
    }
  }

  const handleSave = async () => {
    if (!currentExercise || !weightInput || !repsInput) return

    try {
      await logExercise({
        workoutExerciseId: currentExercise.id,
        setNumber: currentSet,
        weight: Number(weightInput),
        repsDone: Number(repsInput)
      })

      if (currentSet === currentExercise.sets && currentIndex === activeExercises.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setCurrentSet(1)
      } else {
        requestNotificationPermission()
        setDirection(1)
        startTimer(restTimeGoal, workoutId)
      }
    } catch (error) {
      console.error("Erro ao salvar série.", error)
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleNextSlide = () => {
    advanceToNextSet()
  }

  const handlePrevSlide = () => {
    setDirection(-1)
    let nextI = currentIndex
    let nextS = currentSet

    if (currentStep.type !== 'EXERCISE') {
      nextI = currentIndex - 1
      if (steps[nextI] && steps[nextI].type === 'EXERCISE') {
        nextS = steps[nextI].ex.sets
      }
    } else if (currentSet > 1) {
      nextS = currentSet - 1
    } else if (currentIndex > 0) {
      nextI = currentIndex - 1
      nextS = steps[nextI] && steps[nextI].type === 'EXERCISE' ? steps[nextI].ex.sets : 1
    } else {
      return
    }
    
    setCurrentIndex(nextI)
    setCurrentSet(nextS)
    if (steps[nextI] && steps[nextI].type === 'EXERCISE') {
       setIsViewingHistory(localCheckIsSetCompleted(nextI, nextS))
    } else {
       setIsViewingHistory(false)
    }
  }

  const onTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 50

    if (isSwipeLocked) {
      if (Math.abs(distance) > minSwipeDistance) {
        setShakeLock(true)
        setTimeout(() => setShakeLock(false), 400)
      }
      return
    }
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNextSlide()
    }
    if (isRightSwipe) {
      handlePrevSlide()
    }
  }



  let hasUncompletedPreviousSets = false
  if (!localCheckIsSetCompleted(currentIndex, currentSet)) {
    for (let s = 1; s < currentSet; s++) {
      if (!localCheckIsSetCompleted(currentIndex, s)) {
        hasUncompletedPreviousSets = true
        break
      }
    }
  }

  let totalSets = 0
  let completedSets = 0

  activeExercises.forEach(ex => {
    totalSets += ex.sets
    for (let s = 1; s <= ex.sets; s++) {
      const isDone = ex.logs?.some((log: any) => {
        const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        return logDate === todayStr && log.setNumber === s
      })
      if (isDone) completedSets++
    }
  })

  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0
  const isHistoryMode = localCheckIsSetCompleted(currentIndex, currentSet)

  let hasUnsavedChanges = false
  if (isHistoryMode && currentExercise) {
    const currentLog = currentExercise.logs?.find((log: any) => {
      const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
      return logDate === todayStr && log.setNumber === currentSet
    })
    if (currentLog) {
      if (String(currentLog.weight) !== String(weightInput) || String(currentLog.repsDone) !== String(repsInput)) {
        hasUnsavedChanges = true
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60]">
            <div className={cn(
              "flex flex-col bg-zinc-950 overflow-hidden shadow-2xl h-full w-full",
              isHistoryMode ? "ring-inset ring-2 ring-amber-500/20" : ""
            )}>
              {/* Progress Bar Top */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-900 z-50">
                <div
                  className={cn("h-full transition-all duration-500 ease-out", isRestFinished ? "bg-emerald-500" : isHistoryMode ? "bg-amber-600" : "bg-primary")}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Main Content Area */}
              <div
                className="flex-1 flex flex-col relative z-10 overflow-hidden select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={isRestFinished ? 'rest-finished' : (currentStep.type === 'EXERCISE' ? currentStep.ex.id : currentStep.type)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      {isRestFinished ? (
                         <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-zinc-950/80 to-zinc-950 opacity-90 animate-pulse" />
                      ) : currentStep.type === 'EXERCISE' && currentExercise?.exercise?.imageUrl ? (
                        <>
                          <img
                            src={currentExercise.exercise.imageUrl}
                            alt={currentExercise?.exercise?.name}
                            className="w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
                        </>
                      ) : currentStep.type === 'PENDING' ? (
                          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-zinc-950/50 to-zinc-950 opacity-80" />
                      ) : currentStep.type === 'COMPLETED' ? (
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-zinc-950/50 to-zinc-950 opacity-80" />
                      ) : currentStep.type === 'CARDIO' ? (
                          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-zinc-950/50 to-zinc-950 opacity-80" />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center opacity-10">
                          <Dumbbell className="w-64 h-64 text-zinc-800" />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Content */}
                <div className="flex-1 z-10 flex flex-col justify-between px-6 sm:px-12 py-6">

                  <TopBar
                    onClose={onClose}
                    steps={steps}
                    currentIndex={currentIndex}
                    checkIsSetCompleted={localCheckIsSetCompleted}
                    setCurrentIndex={(idx) => {
                      if (idx > currentIndex) setDirection(1);
                      else if (idx < currentIndex) setDirection(-1);
                      setCurrentIndex(idx);
                    }}
                    setCurrentSet={(set) => setCurrentSet(set)}
                    setIsViewingHistory={setIsViewingHistory}
                    setIsSummaryModalOpen={setIsSummaryModalOpen}
                    progressPercent={progressPercent}
                    isHistoryMode={isHistoryMode}
                    isRestFinished={isRestFinished}
                  />

                  {/* Middle Content Animated */}
                  <div className="flex flex-col justify-center flex-1 my-2 overflow-hidden w-full relative">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={currentStep.type === 'EXERCISE' ? currentStep.ex.id : currentStep.type}
                        custom={direction}
                        variants={{
                          enter: (dir: number) => ({
                            x: dir > 0 ? 50 : -50,
                            opacity: 0,
                            scale: 0.95
                          }),
                          center: {
                            x: 0,
                            opacity: 1,
                            scale: 1
                          },
                          exit: (dir: number) => ({
                            x: dir < 0 ? 50 : -50,
                            opacity: 0,
                            scale: 0.95
                          })
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full flex flex-col items-center justify-center h-full"
                      >
                        {currentStep.type === 'EXERCISE' && currentExercise && (
                          <>
                            <div className="text-center mb-8 w-full">
                              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 drop-shadow-xl tracking-tight">
                                {currentExercise.exercise.name}
                              </h2>
                              <div className="flex items-center justify-center gap-2 sm:gap-3 mt-4 flex-wrap">
                                {Array.from({ length: currentExercise.sets }).map((_, idx) => {
                                  const setNum = idx + 1
                                  const isCompleted = localCheckIsSetCompleted(currentIndex, setNum)
                                  const isCurrent = setNum === currentSet

                                  return (
                                    <div
                                      key={setNum}
                                      onClick={() => {
                                        if (setNum > currentSet) setDirection(1);
                                        else if (setNum < currentSet) setDirection(-1);
                                        setCurrentSet(setNum)
                                        setIsViewingHistory(isCompleted)
                                      }}
                                      className={cn(
                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer",
                                        isCompleted && !isCurrent ? (isRestFinished ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" : isHistoryMode ? "bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.5)]") : (!isCurrent ? "bg-zinc-900/80 text-zinc-500 backdrop-blur-md" : ""),
                                        isCurrent ? (isRestFinished ? (isCompleted ? "bg-emerald-600 text-white ring-4 ring-emerald-500/30 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.8)]" : "border-2 border-emerald-500 text-emerald-500 bg-emerald-500/10 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]") : isHistoryMode ? "bg-amber-600 text-white ring-4 ring-amber-500/30 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.8)]" : "border-2 border-primary text-primary bg-primary/10 scale-110") : "border border-zinc-800"
                                      )}
                                    >
                                      {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : setNum}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            <div className="w-full relative flex-1 flex flex-col justify-center">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={isResting ? 'rest' : 'active'}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-full flex flex-col"
                                >
                                  {!isResting ? (
                                    <ActiveSetView
                                      currentExercise={currentExercise}
                                      currentIndex={currentIndex}
                                      currentSet={currentSet}
                                      checkIsSetCompleted={localCheckIsSetCompleted}
                                      setCurrentSet={setCurrentSet}
                                      setIsViewingHistory={setIsViewingHistory}
                                      isHistoryMode={isHistoryMode}
                                      hasUncompletedPreviousSets={hasUncompletedPreviousSets}
                                      weightInput={weightInput}
                                      setWeightInput={setWeightInput}
                                      repsInput={repsInput}
                                      setRepsInput={setRepsInput}
                                      setIsHistoryModalOpen={setIsHistoryModalOpen}
                                      historyLog={historyLog}
                                      hasUnsavedChanges={hasUnsavedChanges}
                                      handleSave={handleSave}
                                      isSaving={isSaving}
                                      goToPendingSet={goToPendingSet}
                                      isPerSide={currentExercise.weightType === 'PER_SIDE'}
                                    />
                                  ) : (
                                    <RestView
                                      addTime={addTime}
                                      restTimeLeft={restTimeLeft}
                                      restTimeGoal={restTimeGoal}
                                      isHistoryMode={isHistoryMode}
                                      historyLog={historyLog}
                                      handleRestFinished={handleRestFinished}
                                      autoAdvanceTimeLeft={autoAdvanceTimeLeft}
                                      isPerSide={currentExercise.weightType === 'PER_SIDE'}
                                    />
                                  )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </>
                        )}

                        {currentStep.type === 'PENDING' && (
                          <PendingPrompt
                            pendingExercisesList={pendingExercisesList}
                            setCurrentIndex={setCurrentIndex}
                            setCurrentSet={setCurrentSet}
                            setPhase={(phase) => {
                              if (phase === 'CARDIO_PROMPT') {
                                setDirection(1)
                                setCurrentIndex(prev => prev + 1)
                              }
                            }} 
                            setIsViewingHistory={setIsViewingHistory}
                          />
                        )}

                        {currentStep.type === 'COMPLETED' && (
                          <CardioPrompt
                            setPhase={(phase) => {
                                if (phase === 'CARDIO_ACTIVE') {
                                    setDirection(1)
                                    setWantsCardio(true)
                                    setCurrentIndex(prev => prev + 1)
                                }
                            }}
                            isUpdatingStatus={isUpdatingStatus}
                            handleSkipCardio={handleSkipCardio}
                          />
                        )}

                        {currentStep.type === 'CARDIO' && (
                          <CardioActive
                            cardioType={cardioType}
                            setCardioType={setCardioType}
                            cardioIntensity={cardioIntensity}
                            setCardioIntensity={setCardioIntensity}
                            cardioTime={cardioTime}
                            setCardioTime={setCardioTime}
                            handleFinishCardio={handleFinishCardio}
                            handleSkipCardio={handleSkipCardio}
                            isSavingCardio={isSavingCardio}
                            isUpdatingStatus={isUpdatingStatus}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <SwipeIndicator
                    isSwipeLocked={isSwipeLocked}
                    setIsSwipeLocked={setIsSwipeLocked}
                    shakeLock={shakeLock}
                    onNext={handleNextSlide}
                    onPrev={handlePrevSlide}
                    hasNext={currentIndex < steps.length - 1}
                  />
                </div>

              </div>
            </div>
      </div>

      <TreinoHistoryDialog
        isOpen={isHistoryModalOpen}
        onOpenChange={setIsHistoryModalOpen}
        exerciseName={currentExercise?.exercise?.name}
        fullHistory={fullHistory}
        isPerSide={currentExercise?.weightType === 'PER_SIDE'}
      />

      <TreinoSummaryDialog
        isOpen={isSummaryModalOpen}
        onOpenChange={setIsSummaryModalOpen}
        progressPercent={progressPercent}
        activeExercises={activeExercises}
        currentIndex={currentIndex}
        currentSet={currentSet}
        isViewingHistory={isViewingHistory}
        checkIsSetCompleted={localCheckIsSetCompleted}
        onNavigate={(idx, targetSet, isFullyDone) => {
          if (idx > currentIndex || (idx === currentIndex && targetSet > currentSet)) {
            setDirection(1)
          } else if (idx < currentIndex || (idx === currentIndex && targetSet < currentSet)) {
            setDirection(-1)
          }
          setCurrentIndex(idx)
          setCurrentSet(targetSet)
          if (isFullyDone) setIsViewingHistory(true)
          else setIsViewingHistory(false)
          setIsSummaryModalOpen(false)
        }}
      />
    </>
  )
}
