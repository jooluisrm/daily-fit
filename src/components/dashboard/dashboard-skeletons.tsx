import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WelcomeCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <Skeleton className="h-9 w-64 bg-zinc-800" />
      <Skeleton className="h-5 w-48 bg-zinc-800/50" />
    </div>
  )
}

export function WeekCalendarSkeleton() {
  return (
    <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-14 shrink-0 rounded-2xl bg-zinc-800" />
      ))}
    </div>
  )
}

export function WeeklyStreakSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="w-16 h-16 rounded-full bg-zinc-800 shrink-0" />
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32 bg-zinc-800" />
              <Skeleton className="h-5 w-16 bg-zinc-800" />
            </div>
            <div className="flex justify-between w-full">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full bg-zinc-800" />
                  <Skeleton className="h-3 w-4 bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-zinc-900 border-zinc-800 flex flex-col justify-center">
          <CardContent className="p-6 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full bg-zinc-800 shrink-0" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-8 w-16 bg-zinc-800" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function TodayWorkoutCardSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 pt-3">
            <Skeleton className="w-5 h-5 rounded-full bg-zinc-800" />
            <Skeleton className="h-5 w-32 bg-zinc-800" />
          </div>
        </CardTitle>
        <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-8 w-32 rounded-md bg-zinc-800" />
        </div>
        <Skeleton className="h-11 w-full rounded-md mt-auto bg-zinc-800" />
      </CardContent>
    </Card>
  )
}

export function WaterTrackerCardSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Skeleton className="w-5 h-5 rounded-full bg-zinc-800" />
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </CardTitle>
        <Skeleton className="h-4 w-48 mt-1 bg-zinc-800" />
      </CardHeader>
      <CardContent className="pt-4 flex flex-col items-center flex-1">
        <Skeleton className="w-48 h-48 rounded-full bg-zinc-800 mb-6" />
        <Skeleton className="h-11 w-full rounded-md mt-auto bg-zinc-800" />
      </CardContent>
    </Card>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800 h-full w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-full bg-zinc-800" />
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </CardTitle>
        <Skeleton className="h-4 w-48 mt-1 bg-zinc-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-md bg-zinc-800" />
      </CardContent>
    </Card>
  )
}

export function DashboardSkeletons() {
  return (
    <div className="animate-in fade-in duration-300">
      <WelcomeCardSkeleton />
      <WeekCalendarSkeleton />

      <div className="flex flex-col gap-6">
        <WeeklyStreakSkeleton />
        <StatsCardsSkeleton />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            <TodayWorkoutCardSkeleton />
          </div>
          <div className="w-full">
            <WaterTrackerCardSkeleton />
          </div>
        </div>

        <div className="w-full">
          <ChartSkeleton />
        </div>
      </div>
    </div>
  )
}
