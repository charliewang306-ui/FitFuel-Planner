import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Save,
  Moon,
  Sun,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Crown,
  Mail,
  FileText,
  Shield,
  RotateCcw,
  Languages,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { supabase } from "@/lib/supabaseClient";

export default function Settings() {
  const { t, i18n } = useTranslation(["settings", "common"]);
  const { toast } = useToast();
  const { isPro, status } = useSubscription();
  const [, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [weightLb, setWeightLb] = useState("160");
  const [heightCm, setHeightCm] = useState("170");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [goal, setGoal] = useState("maintain");
  const [activity, setActivity] = useState("moderate");
  const [unitPref, setUnitPref] = useState("g");
  const [decimalPlaces, setDecimalPlaces] = useState("1");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [snacksCount, setSnacksCount] = useState("0");
  const [waterIntervalHours, setWaterIntervalHours] = useState("2.5");
  const [quietPeriodEnabled, setQuietPeriodEnabled] = useState(false);
  const [autoCompletionEnabled, setAutoCompletionEnabled] = useState(false);

  // Advanced streak control settings
  const [strictMode, setStrictMode] = useState(false);
  const [waterMustMeet, setWaterMustMeet] = useState(false);
  const [kcalWindow, setKcalWindow] = useState("0.10");
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language || "system"
  );

  // Sleep-aware meal scheduling settings
  const [preSleepCutoffHours, setPreSleepCutoffHours] = useState("2.5");
  const [nightModeBufferMin, setNightModeBufferMin] = useState("90");
  const [lastReminderBufferMin, setLastReminderBufferMin] = useState("60");
  const [
    allowLightProteinAfterCutoff,
    setAllowLightProteinAfterCutoff,
  ] = useState(true);
  const [autoRescheduleMeals, setAutoRescheduleMeals] = useState(true);
  const [minGapBetweenMealsMin, setMinGapBetweenMealsMin] = useState("120");

  // Water intake settings (Imperial-first)
  const [waterGoalOverrideOz, setWaterGoalOverrideOz] = useState("");
  const [waterRemindersPerDay, setWaterRemindersPerDay] = useState("8");
  const [todayExerciseMinutes, setTodayExerciseMinutes] = useState("0");

  // 1) 从 Supabase 读取 user_profiles
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw authError || new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          weight_lb,
          height_cm,
          age,
          sex,
          goal,
          activity,
          unit_pref,
          decimal_places,
          wake_time,
          sleep_time,
          snacks_count,
          water_interval_hours,
          quiet_period_enabled,
          auto_completion_enabled,
          strict_mode,
          water_must_meet,
          kcal_window,
          pre_sleep_cutoff_hours,
          night_mode_buffer_min,
          last_reminder_buffer_min,
          allow_light_protein_after_cutoff,
          auto_reschedule_meals,
          min_gap_between_meals_min,
          water_goal_override_oz,
          water_reminders_per_day,
          today_exercise_minutes
        `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // 2) profile 加载好后，填到表单里
  useEffect(() => {
    if (!profile) return;

    setWeightLb(profile.weight_lb?.toString() || "160");
    setHeightCm(profile.height_cm?.toString() || "170");
    setAge(profile.age?.toString() || "30");
    setSex(profile.sex || "male");
    setGoal(profile.goal || "maintain");
    setActivity(profile.activity || "moderate");
    setUnitPref(profile.unit_pref || "g");
    setDecimalPlaces(profile.decimal_places?.toString() || "1");
    setWakeTime(profile.wake_time || "07:00");
    setSleepTime(profile.sleep_time || "23:00");
    setSnacksCount((profile.snacks_count ?? 0).toString());
    setWaterIntervalHours((profile.water_interval_hours ?? 2.5).toString());
    setQuietPeriodEnabled(profile.quiet_period_enabled ?? false);
    setAutoCompletionEnabled(profile.auto_completion_enabled ?? false);

    // Advanced streak control settings
    setStrictMode(profile.strict_mode ?? false);
    setWaterMustMeet(profile.water_must_meet ?? false);
    const kcalWindowValue = profile.kcal_window ?? 0.1;
    setKcalWindow(kcalWindowValue.toFixed(2));

    // Sleep-aware meal scheduling settings
    setPreSleepCutoffHours(
      (profile.pre_sleep_cutoff_hours ?? 2.5).toString()
    );
    setNightModeBufferMin(
      (profile.night_mode_buffer_min ?? 90).toString()
    );
    setLastReminderBufferMin(
      (profile.last_reminder_buffer_min ?? 60).toString()
    );
    setAllowLightProteinAfterCutoff(
      profile.allow_light_protein_after_cutoff ?? true
    );
    setAutoRescheduleMeals(profile.auto_reschedule_meals ?? true);
    setMinGapBetweenMealsMin(
      (profile.min_gap_between_meals_min ?? 120).toString()
    );

    // Water intake settings
    setWaterGoalOverrideOz(
      profile.water_goal_override_oz?.toString() || ""
    );
    setWaterRemindersPerDay(
      (profile.water_reminders_per_day ?? 8).toString()
    );
    setTodayExerciseMinutes(
      (profile.today_exercise_minutes ?? 0).toString()
    );
  }, [profile]);

  // Save settings handler with validation
  const handleSave = () => {
    const weightValue = parseFloat(weightLb);
    const heightValue = parseFloat(heightCm);
    const ageValue = parseInt(age);
    const decimalValue = parseInt(decimalPlaces);

    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: t("settings:saveError"),
        description: t("settings:invalidWeight"),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(heightValue) || heightValue < 120 || heightValue > 220) {
      toast({
        title: t("settings:saveError"),
        description: t("settings:invalidHeight"),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(ageValue) || ageValue < 15 || ageValue > 100) {
      toast({
        title: t("settings:saveError"),
        description: t("settings:invalidAge"),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(decimalValue)) {
      toast({
        title: t("settings:saveError"),
        description: t("settings:invalidDecimal"),
        variant: "destructive",
      });
      return;
    }

    // 通过校验，开始保存
    saveMutation.mutate({
      weightValue,
      heightValue,
      ageValue,
      decimalValue,
    });
  };

  // 3) 保存设置：直接写 Supabase
  const saveMutation = useMutation({
    mutationFn: async (data: {
      weightValue: number;
      heightValue: number;
      ageValue: number;
      decimalValue: number;
    }) => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw authError || new Error("Not authenticated");
      }

      const payload = {
        id: user.id,
        weight_lb: data.weightValue,
        height_cm: data.heightValue,
        age: data.ageValue,
        sex,
        goal,
        activity,
        unit_pref: unitPref,
        decimal_places: data.decimalValue,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        snacks_count: parseInt(snacksCount) || 0,
        water_interval_hours: parseFloat(waterIntervalHours) || 2.5,
        quiet_period_enabled: quietPeriodEnabled,
        auto_completion_enabled: autoCompletionEnabled,
        strict_mode: strictMode,
        water_must_meet: waterMustMeet,
        kcal_window: parseFloat(kcalWindow) || 0.1,
        pre_sleep_cutoff_hours: parseFloat(preSleepCutoffHours) || 2.5,
        night_mode_buffer_min: parseInt(nightModeBufferMin) || 90,
        last_reminder_buffer_min: parseInt(lastReminderBufferMin) || 60,
        allow_light_protein_after_cutoff: allowLightProteinAfterCutoff,
        auto_reschedule_meals: autoRescheduleMeals,
        min_gap_between_meals_min:
          parseInt(minGapBetweenMealsMin) || 120,
        water_goal_override_oz: waterGoalOverrideOz
          ? parseFloat(waterGoalOverrideOz)
          : null,
        water_reminders_per_day:
          parseInt(waterRemindersPerDay) || 8,
        today_exercise_minutes:
          parseInt(todayExerciseMinutes) || 0,
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      // 下面这两行只是标记其它数据过期，不会发 /api 请求，所以保留没关系
      queryClient.invalidateQueries({ queryKey: ["/api/targets/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary/today"] });
      toast({
        title: t("settings:saved"),
        description: t("settings:savedDesc"),
      });
    },
    onError: () => {
      toast({
        title: t("settings:saveError"),
        description: t("settings:saveErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (lang === "system") {
      const browserLang = navigator.language;
      const supportedLang = SUPPORTED_LANGUAGES.find(
        (l) => browserLang.startsWith(l.code) && l.code !== "system"
      );
      i18n.changeLanguage(supportedLang?.code || "en");
      localStorage.removeItem("fitfuel-language");
    } else {
      i18n.changeLanguage(lang);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      queryClient.clear();
      toast({
        title: t("settings:logoutSuccess"),
        description: t("settings:logoutSuccessDesc"),
      });
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t("settings:logoutError"),
        description: t("settings:logoutErrorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* 下面整块 UI 基本不动，保持原样 */}
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-semibold text-foreground">
            {t("settings:title")}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            data-testid="button-toggle-theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      {/* ……从这里开始一直到文件结尾，都和你原来的完全一样，我没有动 UI 结构 …… */}

      {/* 为了不让这条消息超长，我不再重复粘贴下面那一大段 JSX。
          你可以保留你自己文件里 header 下面的所有 JSX，不需要改动。 */}
    </div>
  );
}
