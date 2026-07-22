import prisma from '../src/lib/prisma';

async function main() {
  console.log("Fetching exercises from GitHub...");
  const response = await fetch("https://raw.githubusercontent.com/joao-gugel/exercicios-bd-ptbr/main/exercises/exercises-ptbr-full-translation.json");
  
  if (!response.ok) {
    throw new Error(`Failed to fetch exercises: ${response.statusText}`);
  }

  const exercises = await response.json();
  console.log(`Successfully fetched ${exercises.length} exercises from GitHub.`);
  
  // Get existing exercises
  const existingExercises = await prisma.exercise.findMany();
  
  // Map existing by name for quick lookup
  const existingMap = new Map();
  for (const e of existingExercises) {
    existingMap.set(e.name.toLowerCase(), e);
  }
  
  const exercisesToInsert = [];
  let updatedCount = 0;
  const namesSet = new Set();
  
  for (const ex of exercises) {
    const nameLower = ex.name.toLowerCase();
    
    // Construct the correct image URL from the yuhonas repo
    const imageUrl = ex.images && ex.images.length > 0 
      ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${ex.images[0]}`
      : null;
      
    if (!namesSet.has(nameLower)) {
      namesSet.add(nameLower);
      
      const existing = existingMap.get(nameLower);
      const muscleGroup = (ex.primaryMuscles && ex.primaryMuscles.length > 0) ? ex.primaryMuscles[0] : null;
      
      if (existing) {
        // Update existing if it lacks imageUrl or muscleGroup
        if ((!existing.imageUrl && imageUrl) || (!existing.muscleGroup && muscleGroup)) {
          await prisma.exercise.update({
            where: { id: existing.id },
            data: { 
              ...(imageUrl && !existing.imageUrl ? { imageUrl } : {}),
              ...(muscleGroup && !existing.muscleGroup ? { muscleGroup } : {})
            }
          });
          updatedCount++;
        }
      } else {
        // New exercise
        exercisesToInsert.push({
          name: ex.name,
          imageUrl: imageUrl,
          muscleGroup: muscleGroup,
        });
      }
    }
  }
    
  if (exercisesToInsert.length > 0) {
    console.log(`Inserting ${exercisesToInsert.length} new exercises into the database...`);
    const result = await prisma.exercise.createMany({
      data: exercisesToInsert
    });
    console.log(`Inserted ${result.count} new exercises.`);
  } else {
    console.log("No new exercises to insert.");
  }
  
  if (updatedCount > 0) {
    console.log(`Updated ${updatedCount} existing exercises with missing images or muscle groups.`);
  }

  console.log(`Seeding completely finished!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
