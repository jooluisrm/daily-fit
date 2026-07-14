"use client"

import { useState } from "react"
import { WelcomeCard } from "@/src/components/dashboard/welcome-card"
import { WeekCalendar } from "@/src/components/dashboard/week-calendar"
import { TodayWorkoutCard } from "@/src/components/dashboard/today-workout-card"
import { StatsCards } from "@/src/components/dashboard/stats-cards"
import { WeeklyStreak } from "@/src/components/dashboard/weekly-streak"
import { useDashboardStats } from "@/src/hooks/use-dashboard"

import { WeightChart } from "@/src/components/dashboard/weight-chart"
import { CardioChart } from "@/src/components/dashboard/cardio-chart"
import { WaterTrackerCard } from "@/src/components/dashboard/water-tracker"
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from "@/components/ui/carousel"

export default function DashboardPage() {
  const { data: stats } = useDashboardStats()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8 md:pt-8">
      <WelcomeCard />
      <WeekCalendar />

      <div className="flex flex-col gap-6">
        <WeeklyStreak streak={stats?.streak || []} />

        <StatsCards
          totalWorkouts={stats?.totalWorkouts || 0}
          totalVolume={stats?.totalVolume || 0}
          totalCardioMinutes={stats?.totalCardioMinutes || 0}
          volumeByWorkout={stats?.volumeByWorkout || {}}
          activeWorkouts={stats?.activeWorkouts || []}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            <TodayWorkoutCard />
          </div>
          <div className="w-full">
            <WaterTrackerCard />
          </div>
        </div>

        <div className="relative">
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
        </div>
      </div>
    </div>
  )
}
