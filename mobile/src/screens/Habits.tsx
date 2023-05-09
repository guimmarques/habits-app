import { useRoute } from "@react-navigation/native";
import { Alert, ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import dayjs from "dayjs";
import { ProgressBar } from "../components/ProgressBar";
import { Checkbox } from "../components/Checkbox";
import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";

interface HabitParams {
  date: string;
  onCompletedChanged: (completed: number) => void;
}

type HabitsInfo = {
  possibleHabits: {
    id: string;
    title: string;
    created_at: string;
  }[];
  completedHabits: string[];
};

export function Habit() {
  const { params } = useRoute();
  const { date, onCompletedChanged } = params as HabitParams;
  const [loading, setLoading] = useState(true);
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>();

  const parsedDate = dayjs(date);
  const dayOfWeek = parsedDate.format("dddd");
  const dayAndMonth = parsedDate.format("DD/MM");

  const habitsProgress =
    habitsInfo?.possibleHabits.length || 0 > 0
      ? generateProgressPercentage(
          habitsInfo!.possibleHabits.length,
          habitsInfo!.completedHabits.length
        )
      : 0;

  async function fetchHabits() {
    try {
      setLoading(true);
      const response = await api.get("day", { params: { date } });

      setHabitsInfo(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Ops",
        "Não foi possivel carregar as informações dos hábitos"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  async function handleToggleHabit(habitId: string) {
    await api.patch(`/habits/${habitId}/toggle`);

    const isHabitAlreadyCompleted =
      habitsInfo?.completedHabits.includes(habitId);

    let completedHabits: string[] = [];

    if (isHabitAlreadyCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(
        (habit) => habit !== habitId
      );
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habitId];
    }

    setHabitsInfo({
      possibleHabits: habitsInfo!.possibleHabits,
      completedHabits,
    });

    // onCompletedChanged(completedHabits.length);
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-white font-extrabold - text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={habitsProgress} />

        <View className="mt-6">
          {habitsInfo?.possibleHabits.map((habit) => {
            return (
              <Checkbox
                key={habit.id}
                title={habit.title}
                onPress={() => handleToggleHabit(habit.id)}
                checked={habitsInfo.completedHabits.includes(habit.id)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
