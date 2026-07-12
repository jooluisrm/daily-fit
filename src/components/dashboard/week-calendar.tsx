export function WeekCalendar() {
  const days = [
    { label: "Dom", date: "12", active: false },
    { label: "Seg", date: "13", active: false },
    { label: "Ter", date: "14", active: true },
    { label: "Qua", date: "15", active: false },
    { label: "Qui", date: "16", active: false },
    { label: "Sex", date: "17", active: false },
    { label: "Sáb", date: "18", active: false },
  ]

  return (
    <div className="w-full mb-8 overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex justify-between md:justify-start gap-2 min-w-max">
        {days.map((day, i) => (
          <button 
            key={i} 
            className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-colors ${
              day.active 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <span className="text-xs font-medium uppercase mb-1">{day.label}</span>
            <span className={`text-lg font-bold ${day.active ? "text-primary-foreground" : "text-white"}`}>
              {day.date}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
