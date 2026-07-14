import prisma from '../src/lib/prisma';

async function main() {
  console.log("Starting to seed test data...");

  // 1. Get the first user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found in the database. Please log in to the app first to create a user.");
    process.exit(1);
  }
  console.log(`Using user: ${user.name || user.email || user.id}`);

  // 2. Get some exercises to use
  const allExercises = await prisma.exercise.findMany({
    take: 24
  });

  if (allExercises.length < 4) {
    console.error("Not enough exercises in the database. Please run seed-exercises.ts first.");
    process.exit(1);
  }

  // 3. Create 6 workouts
  const workoutNames = ['Treino A - Peito e Tríceps', 'Treino B - Costas e Bíceps', 'Treino C - Pernas Completo', 'Treino D - Ombros e Abdômen', 'Treino E - Full Body', 'Treino F - Funcional e Cardio'];
  
  let exerciseIndex = 0;

  for (let i = 0; i < 6; i++) {
    console.log(`Creating Workout: ${workoutNames[i]}`);
    
    // Create Workout
    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        name: workoutNames[i],
        daysOfWeek: "[]", // No specific days for test data
      }
    });

    // Create 4 WorkoutExercises
    const workoutExercises = [];
    for (let j = 0; j < 4; j++) {
      // Loop over exercises if we run out
      const exercise = allExercises[exerciseIndex % allExercises.length];
      exerciseIndex++;

      const we = await prisma.workoutExercise.create({
        data: {
          workoutId: workout.id,
          exerciseId: exercise.id,
          sets: 4,
          reps: "10-12",
          order: j
        }
      });
      workoutExercises.push(we);
    }

    // Create 3 historical logs for each workout to provide some data
    for (let h = 1; h <= 3; h++) {
      // Create past dates (e.g., h weeks ago)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (h * 7) + i); // Offset by i to distribute days
      
      const startTime = new Date(pastDate);
      startTime.setHours(18, 0, 0, 0); // 18:00
      
      const endTime = new Date(pastDate);
      endTime.setHours(19, 15, 0, 0); // 19:15

      const workoutLog = await prisma.workoutLog.create({
        data: {
          userId: user.id,
          workoutId: workout.id,
          status: "COMPLETED",
          startTime: startTime,
          endTime: endTime,
          date: pastDate,
          hasCardio: false
        }
      });

      // Create ExerciseLogs (4 sets per exercise)
      for (const we of workoutExercises) {
        // Base weight and reps just to simulate progression/data
        const baseWeight = 20 + (Math.random() * 20); // Random weight between 20 and 40
        
        for (let set = 1; set <= 4; set++) {
          await prisma.exerciseLog.create({
            data: {
              workoutExerciseId: we.id,
              workoutLogId: workoutLog.id,
              setNumber: set,
              weight: Math.round(baseWeight + (set * 2.5)), // Increase weight slightly each set
              repsDone: Math.round(8 + Math.random() * 4), // 8 to 12 reps
              date: pastDate
            }
          });
        }
      }
    }
    console.log(`Finished creating data for ${workoutNames[i]}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
