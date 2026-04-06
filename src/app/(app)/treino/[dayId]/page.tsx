import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkoutDayView } from "@/components/workout/WorkoutDayView";
import type { WorkoutPlan } from "@/types/database";

interface Props {
  params: Promise<{ dayId: string }>;
}

export default async function TreinoDayPage({ params }: Props) {
  const { dayId } = await params;
  const dayIndex = parseInt(dayId, 10);

  if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!data) notFound();

  const plan = data as WorkoutPlan;

  return (
    <WorkoutDayView
      plan={plan}
      activeDayIndex={dayIndex}
    />
  );
}
