import { useState } from "react";
import { useQuiz, Group } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles, Play, RefreshCw, Trophy } from "lucide-react";

const generateNames = (count: number) =>
  Array.from({ length: count }, (_, i) => `Group ${i + 1}`);

const WINNER_OPTIONS = [
  { value: 1, label: "1 Winner" },
  { value: 2, label: "1 Winner + 1 Runner-up" },
  { value: 3, label: "Top 3 (Gold, Silver, Bronze)" },
  { value: 4, label: "1 Winner + 3 Runners-up" },
  { value: 5, label: "Top 5 Winners" },
];

export default function SetupForm() {
  const { setupQuiz } = useQuiz();
  const [numGroups, setNumGroups] = useState(6);
  const [numRounds, setNumRounds] = useState(3);
  const [numSubRounds, setNumSubRounds] = useState<number[]>([1, 1, 1]);
  const [numWinners, setNumWinners] = useState(3);
  const [names, setNames] = useState<string[]>(generateNames(6));

  const handleGroupCountChange = (val: number) => {
    const clamped = Math.max(2, Math.min(30, val));
    setNumGroups(clamped);
    setNames((prev) => {
      const generated = generateNames(clamped);
      return generated.map((g, i) => (i < prev.length ? prev[i] : g));
    });
  };

  const handleRoundsChange = (val: number) => {
    const clamped = Math.max(1, Math.min(20, val));
    setNumRounds(clamped);
    setNumSubRounds((prev) => {
      const newArray = Array(clamped).fill(1);
      for (let i = 0; i < Math.min(prev.length, clamped); i++) {
        newArray[i] = prev[i];
      }
      return newArray;
    });
  };

  const handleSubRoundsChange = (roundIndex: number, val: number) => {
    const clamped = Math.max(1, Math.min(10, val));
    setNumSubRounds((prev) => {
      const newArray = [...prev];
      newArray[roundIndex] = clamped;
      return newArray;
    });
  };

  const randomizeNames = () => setNames(generateNames(numGroups));

  const handleStart = () => {
    const groups: Group[] = names.slice(0, numGroups).map((name, i) => ({
      id: `group-${i}`,
      name: name || `Group ${i + 1}`,
      scores: Array.from({ length: numRounds }, (_, rIndex) => Array(numSubRounds[rIndex]).fill(0)),
    }));
    setupQuiz(groups, numRounds, numSubRounds, numWinners);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-display font-semibold text-sm mb-4"
        >
          <Sparkles className="w-4 h-4" />
          Quiz Scoreboard
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">
          Set Up Your Quiz
        </h1>
        <p className="text-muted-foreground text-lg">
          Configure teams, rounds, and winners — then let the competition begin!
        </p>
      </div>

      <div className="bg-card rounded-xl border p-6 md:p-8 space-y-6 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Number of Groups</label>
            <Input
              type="number"
              min={2}
              max={30}
              value={numGroups}
              onChange={(e) => handleGroupCountChange(Number(e.target.value))}
              className="text-lg font-display"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Number of Rounds</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={numRounds}
              onChange={(e) => handleRoundsChange(Number(e.target.value))}
              className="text-lg font-display"
            />
          </div>
        </div>

        {/* Per-Round Sub-Rounds Configuration */}
        <div className="border-t border-border/50 pt-4">
            <label className="text-sm font-medium mb-3 block text-primary">Sub-Rounds per Round</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto pr-2">
              {numSubRounds.map((count, idx) => (
                <div key={idx} className="bg-primary/5 rounded-lg p-2 border border-primary/10">
                  <label className="text-xs text-muted-foreground mb-1 block">Round {idx + 1}</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={count}
                    onChange={(e) => handleSubRoundsChange(idx, Number(e.target.value))}
                    className="h-8 text-sm font-display focus-visible:ring-primary/40 bg-white"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Default is 1. Increase for multiple parts in a specific round.</p>
        </div>

        {/* Winner Count Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            How Many Winners?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WINNER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setNumWinners(opt.value)}
                className={`px-4 py-3 rounded-lg text-sm font-display font-semibold text-left transition-all border-2 ${
                  numWinners === opt.value
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Group Names</label>
            <Button variant="ghost" size="sm" onClick={randomizeNames} className="gap-1.5 text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
              Randomize
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {names.slice(0, numGroups).map((name, i) => (
              <Input
                key={i}
                value={name}
                onChange={(e) => {
                  const updated = [...names];
                  updated[i] = e.target.value;
                  setNames(updated);
                }}
                className="text-sm"
                placeholder={`Group ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <Button onClick={handleStart} size="lg" className="w-full text-lg gap-2 font-display font-semibold">
          <Play className="w-5 h-5" />
          Start Quiz
        </Button>
      </div>
    </motion.div>
  );
}
