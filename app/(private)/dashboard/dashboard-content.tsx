"use client"

import { WelcomeCard } from "@/src/components/dashboard/welcome-card"
import { TodayWorkoutCard } from "@/src/components/dashboard/today-workout-card"
import { StatsCards } from "@/src/components/dashboard/stats-cards"
import { WeeklyStreak } from "@/src/components/dashboard/weekly-streak"
import { useDashboardStats } from "@/src/hooks/use-dashboard"

import { WeightChart } from "@/src/components/dashboard/weight-chart"
import { CardioChart } from "@/src/components/dashboard/cardio-chart"
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker"
import { CreatineTrackerCard } from "@/src/components/dashboard/creatine-tracker-card"
import { ProgressCtaCard } from "@/src/components/dashboard/progress-cta-card"
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/ui/carousel"
import { motion, Variants } from "framer-motion"

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export default function DashboardContent() {
  const { data: stats } = useDashboardStats()

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="flex flex-col gap-6 w-full"
    >
      <motion.div variants={item}>
        <WelcomeCard />
      </motion.div>

      <motion.div variants={item}>
        <ProgressCtaCard />
      </motion.div>

      <motion.div variants={item}>
        <WeeklyStreak streak={stats?.streak || []} />
      </motion.div>

      <motion.div variants={item}>
        <StatsCards
          totalWorkouts={stats?.totalWorkouts || 0}
          totalVolume={stats?.totalVolume || 0}
          totalCardioMinutes={stats?.totalCardioMinutes || 0}
          volumeByWorkout={stats?.volumeByWorkout || {}}
          lastWeekTotalWorkouts={stats?.lastWeekTotalWorkouts || 0}
          lastWeekTotalVolume={stats?.lastWeekTotalVolume || 0}
          lastWeekTotalCardioMinutes={stats?.lastWeekTotalCardioMinutes || 0}
          lastWeekVolumeByWorkout={stats?.lastWeekVolumeByWorkout || {}}
          activeWorkouts={stats?.activeWorkouts || []}
        />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="w-full h-full flex flex-col">
          <TodayWorkoutCard />
        </div>
        <div className="w-full h-full flex flex-col gap-6">
          <WaterTrackerCard />
          <CreatineTrackerCard />
        </div>
      </motion.div>

      <motion.div variants={item} className="relative w-full">
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            <CarouselItem className="w-full">
              <WeightChart />
            </CarouselItem>
            <CarouselItem className="w-full">
              <CardioChart />
            </CarouselItem>
          </CarouselContent>
          <CarouselDots />
        </Carousel>
      </motion.div>
    </motion.div>
  )
}
