export const checkIsSetCompleted = (
  activeExercises: any[],
  exerciseIndex: number,
  setNum: number,
  todayStr: string
) => {
  const ex = activeExercises[exerciseIndex]
  if (!ex) return false
  return ex.logs?.some((log: any) => {
    const logDate = new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return logDate === todayStr && log.setNumber === setNum
  }) || false
}

export const findNextPendingSet = (
  activeExercises: any[],
  startIndex: number,
  startSet: number,
  todayStr: string
) => {
  // 1. Search forward from current position
  for (let i = startIndex; i < activeExercises.length; i++) {
    const ex = activeExercises[i]
    const startS = (i === startIndex) ? startSet : 1
    for (let s = startS; s <= ex.sets; s++) {
      if (!checkIsSetCompleted(activeExercises, i, s, todayStr)) {
        return { index: i, set: s }
      }
    }
  }

  // 2. Wrap around from the beginning
  for (let i = 0; i < startIndex; i++) {
    const ex = activeExercises[i]
    for (let s = 1; s <= ex.sets; s++) {
      if (!checkIsSetCompleted(activeExercises, i, s, todayStr)) {
        return { index: i, set: s }
      }
    }
  }

  // 3. Check remaining sets in the starting exercise (before startSet)
  if (activeExercises[startIndex]) {
    for (let s = 1; s < startSet; s++) {
      if (!checkIsSetCompleted(activeExercises, startIndex, s, todayStr)) {
        return { index: startIndex, set: s }
      }
    }
  }

  return null
}

export const formatTime = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
