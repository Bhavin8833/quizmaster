import { useState } from "react";
import { useQuiz, Group } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Trophy, Play, RefreshCw, Users, Layers, Award,
  Zap, Monitor, BarChart3, ArrowRight
} from "lucide-react";

const generateNames = (count: number) =>
  Array.from({ length: count }, (_, i) => `Group ${i + 1}`);

const WINNER_OPTIONS = [
  { value: 1, label: "1 Winner" },
  { value: 2, label: "1 + 1 Runner-up" },
  { value: 3, label: "Top 3" },
  { value: 4, label: "1 + 3 Runners-up" },
  { value: 5, label: "Top 5" },
];

const FEATURES = [
  { icon: Users, title: "Manage Groups", desc: "Add up to 30 teams with custom names" },
  { icon: Layers, title: "Multi-Round Scoring", desc: "Track scores across unlimited rounds" },
  { icon: BarChart3, title: "Live Leaderboard", desc: "Real-time rankings for each round" },
  { icon: Monitor, title: "Projector Mode", desc: "Share a display link for the big screen" },
  { icon: Award, title: "Winner Reveal", desc: "Dramatic ceremony with sound & animation" },
  { icon: Zap, title: "Instant Setup", desc: "Get started in under 30 seconds" },
];

export default function LandingPage() {
  const { setupQuiz } = useQuiz();
  const [numGroups, setNumGroups] = useState<number | "">(10);
  const [numRounds, setNumRounds] = useState<number | "">(3);
  const [numSubRounds, setNumSubRounds] = useState<number[]>([1, 1, 1]);
  const [numWinners, setNumWinners] = useState(3);
  const [names, setNames] = useState<string[]>(generateNames(10));

  const scrollToSetup = () => {
    const el = document.getElementById("setup");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleGroupCountChange = (val: string) => {
    if (val === "") {
      setNumGroups("");
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;

    // Only clamp the maximum instantly so it does not exceed 30
    const maxClamped = Math.min(30, num);
    setNumGroups(maxClamped);

    // Keep names generated up to the clamped value, but at least 2 for UI stability
    const exact = Math.max(2, maxClamped);
    setNames((prev) => {
      const generated = generateNames(exact);
      return generated.map((g, i) => (i < prev.length ? prev[i] : g));
    });
  };

  const randomizeNames = () => {
    const finalGroupsCount = Math.max(2, Math.min(30, Number(numGroups) || 2));
    setNames(generateNames(finalGroupsCount));
  };

  const handleStart = () => {
    const finalGroupsCount = Math.max(2, Math.min(30, Number(numGroups) || 2));
    const finalRoundsCount = Math.max(1, Math.min(20, Number(numRounds) || 1));

    const groups: Group[] = names.slice(0, finalGroupsCount).map((name, i) => ({
      id: `group-${i}`,
      name: name || `Group ${i + 1}`,
      scores: Array.from({ length: finalRoundsCount }, (_, rIndex) => Array(numSubRounds[rIndex] || 1).fill(0)),
    }));
    setupQuiz(groups, finalRoundsCount, numSubRounds, numWinners);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">QuizMaster Live</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#setup" className="hover:text-foreground transition-colors">Get Started</a>
          </div>
          <Button size="sm" onClick={scrollToSetup} className="gap-1.5 font-display font-semibold">
            Start a Session
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1]">
                Host Live Quiz{" "}
                <span className="text-primary">Competitions.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg">
                Manage groups. Track scores in real-time. Reveal winners with a dramatic ceremony.
                Make every quiz unforgettable.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={scrollToSetup}
                  className="gap-2 font-display font-semibold text-base px-8"
                >
                  Start a Session
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="gap-2 font-display text-base"
                >
                  <a href="#features">
                    <Play className="w-4 h-4" />
                    See Features
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border p-6 shadow-lg"
                >
                  <p className="text-sm text-muted-foreground mb-1">Groups Supported</p>
                  <p className="text-4xl font-display font-bold">30</p>
                  <p className="text-xs text-secondary mt-1">↑ Fully customizable</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border p-6 shadow-lg"
                >
                  <p className="text-sm text-muted-foreground mb-1">Live Display</p>
                  <p className="text-4xl font-display font-bold">
                    <Monitor className="w-9 h-9 text-primary inline" />
                  </p>
                  <p className="text-xs text-secondary mt-1">↑ Shareable link</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-card rounded-2xl border p-6 shadow-lg col-span-2"
                >
                  <p className="text-sm text-muted-foreground mb-1">Winner Ceremony</p>
                  <p className="text-2xl font-display font-bold">🥇 🥈 🥉 Dramatic Reveal</p>
                  <p className="text-xs text-secondary mt-1">↑ With sound & animations</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps to run your live quiz competition.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <section id="setup" className="py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Start Your <span className="text-primary">Session</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Configure teams, rounds, and winners — then let the competition begin!
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl -z-10 rounded-full opacity-50" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card/70 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-white/10 p-6 md:p-10 space-y-8 shadow-2xl relative z-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Number of Groups</label>
                  <Input
                    type="number"
                    min={2}
                    max={30}
                    value={numGroups}
                    onChange={(e) => handleGroupCountChange(e.target.value)}
                    onBlur={() => setNumGroups(Math.max(2, Math.min(30, Number(numGroups) || 2)))}
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
                    onChange={(e) => {
                      if (e.target.value === "") {
                        setNumRounds("");
                      } else {
                        const count = Math.min(20, parseInt(e.target.value, 10));
                        setNumRounds(count);
                        setNumSubRounds((prev) => {
                          const newArray = Array(count).fill(1);
                          for (let i = 0; i < Math.min(prev.length, count); i++) {
                            newArray[i] = prev[i];
                          }
                          return newArray;
                        });
                      }
                    }}
                    onBlur={() => {
                        const count = Math.max(1, Math.min(20, Number(numRounds) || 1));
                        setNumRounds(count);
                        setNumSubRounds((prev) => {
                          const newArray = Array(count).fill(1);
                          for (let i = 0; i < Math.min(prev.length, count); i++) {
                            newArray[i] = prev[i];
                          }
                          return newArray;
                        });
                    }}
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
                          onChange={(e) => {
                              const clamped = Math.max(1, Math.min(10, Number(e.target.value)));
                              setNumSubRounds((prev) => {
                                const newArray = [...prev];
                                newArray[idx] = clamped;
                                return newArray;
                              });
                          }}
                          className="h-8 text-sm font-display focus-visible:ring-primary/40 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Default is 1. Increase for multiple parts in a specific round.</p>
              </div>

              {/* Winner Count */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  How Many Winners?
                </label>
                <div className="flex flex-wrap gap-2">
                  {WINNER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNumWinners(opt.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-display font-semibold transition-all border-2 ${numWinners === opt.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group Names */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Group Names</label>
                  <Button variant="ghost" size="sm" onClick={randomizeNames} className="gap-1.5 text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {names.slice(0, Number(numGroups) || 2).map((name, i) => (
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">QuizMaster Live</span>
          </div>
          <p className="text-sm text-muted-foreground">Built for quiz competitions everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
