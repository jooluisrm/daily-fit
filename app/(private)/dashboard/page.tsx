import { WelcomeCard } from "@/src/components/dashboard/welcome-card"
import { WeekCalendar } from "@/src/components/dashboard/week-calendar"
import { TodayWorkoutCard } from "@/src/components/dashboard/today-workout-card"
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker-card"
import { CaloriesCard } from "@/src/components/dashboard/calories-card"

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <WelcomeCard />
      <WeekCalendar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-1">
          <TodayWorkoutCard />
        </div>
        <div>
          <WaterTrackerCard />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <CaloriesCard />
        </div>
      </div>
    </div>
  )
}
