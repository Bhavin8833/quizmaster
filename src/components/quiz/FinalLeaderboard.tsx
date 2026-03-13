/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, useRef } from "react";
import { useQuiz } from "@/context/QuizContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Crown, PartyPopper, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

import { db } from "@/lib/firebase";
import { ref, set } from "firebase/database";

const medalConfig = [
  { bg: "bg-gold/20", border: "border-gold", text: "text-gold", icon: Trophy, label: "🥇", title: "1st Place — Winner" },
  { bg: "bg-silver/20", border: "border-silver", text: "text-silver", icon: Medal, label: "🥈", title: "2nd Place" },
  { bg: "bg-bronze/20", border: "border-bronze", text: "text-bronze", icon: Award, label: "🥉", title: "3rd Place" },
];

export function getWinnerMedal(idx: number) {
  if (idx < 3) return medalConfig[idx];
  return {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    icon: Star,
    label: `#${idx + 1}`,
    title: `${idx + 1}th Place — Runner-up`,
  };
}

// Web Audio API sound effects
function playSound(type: "drumroll" | "reveal" | "winner" | "applause") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (type === "drumroll") {
      for (let i = 0; i < 20; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 100 + Math.random() * 60;
        osc.type = "triangle";
        gain.gain.value = 0.08;
        const t = ctx.currentTime + i * 0.05;
        osc.start(t);
        osc.stop(t + 0.04);
      }
    } else if (type === "reveal") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "winner") {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.value = 0.1;
        const t = ctx.currentTime + i * 0.2;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } else if (type === "applause") {
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const noise = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 3000;
      noise.buffer = buffer;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      noise.start();
    }
  } catch (e) {
    // Audio not available
  }
}

export default function FinalLeaderboard({ onClose }: { onClose: () => void }) {
  const { getLeaderboard, numRounds, numWinners } = useQuiz();
  const leaderboard = getLeaderboard();
  // revealedCount: how many winners have been revealed (from last to first)
  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "revealing" | "complete">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const winners = leaderboard.slice(0, numWinners);
  const rest = leaderboard.slice(numWinners);

  // Reveal sequence: reveal from last winner to 1st
  const startReveal = useCallback(() => {
    setPhase("revealing");
    setRevealedCount(0);

    // Play drumroll for the very first reveal
    playSound("drumroll");

    // Auto-reveal the first (lowest placed) winner after a short drumroll
    timerRef.current = setTimeout(() => {
      setRevealedCount(1);
      playSound("reveal");

      // Edge case: if there's only 1 winner total
      if (winners.length === 1) {
        playSound("winner");
        setShowConfetti(true);
      }
    }, 1200);
  }, [winners.length]);

  const revealNextWinner = () => {
    const nextStep = revealedCount + 1;
    const totalSteps = winners.length;

    if (nextStep < totalSteps) {
      // Normal runner up
      playSound("reveal");
      setRevealedCount(nextStep);
    } else if (nextStep === totalSteps) {
      // The final champion
      playSound("drumroll");
      timerRef.current = setTimeout(() => {
        setRevealedCount(nextStep);
        playSound("winner");
        setShowConfetti(true);
      }, 1200);
    }
  };

  const showFullLeaderboard = () => {
    playSound("applause");
    setPhase("complete");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync state to display via Firebase
  useEffect(() => {
    const data = {
      type: "final" as const,
      numWinners,
      groups: leaderboard.map((g) => ({ id: g.id, name: g.name, score: g.total, rank: g.rank })),
      phase,
      revealedCount,
      showConfetti
    };
    
    set(ref(db, "quiz-display"), data)
      .catch(err => console.error("Final Reveal Sync Error:", err));
  }, [phase, revealedCount, showConfetti, leaderboard, numWinners]);

  // Build revealed winners list (revealed from bottom rank to top)
  const revealedWinners = winners.slice(0, revealedCount).reverse();
  // We reverse so that the LAST winner revealed is index 0 (the champion)

  // Actually we reveal from position numWinners down to 1
  // So revealedCount=1 means we showed the numWinners-th place
  // revealedCount=numWinners means we showed 1st place
  const getRevealedPositions = () => {
    // Returns positions from bottom to top that have been revealed
    const positions: number[] = [];
    for (let i = 0; i < revealedCount; i++) {
      positions.push(numWinners - 1 - i); // e.g. for 3 winners: first reveal idx 2, then 1, then 0
    }
    return positions;
  };
  const revealedPositions = getRevealedPositions();

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-20"
        onClick={onClose}
      >
        Exit
      </Button>

      <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-2">
            🏆 Final Results
          </h1>
          <p className="text-muted-foreground text-xl">
            {numRounds} Rounds · Combined Scores
          </p>
        </motion.div>

        {phase === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Button
              size="lg"
              onClick={startReveal}
              className="text-xl px-10 py-6 gap-3 font-display font-bold animate-pulse"
            >
              <PartyPopper className="w-6 h-6" />
              Reveal Winners!
            </Button>
          </motion.div>
        )}

        {phase === "revealing" && revealedCount === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-4xl md:text-6xl font-display font-bold text-primary"
            >
              🥁 Drum Roll... 🥁
            </motion.p>
          </motion.div>
        )}

        {/* Manual Controls */}
        {phase === "revealing" && revealedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 z-40"
          >
            {revealedCount < numWinners ? (
              <Button
                size="lg"
                onClick={revealNextWinner}
                className="text-lg px-8 py-6 gap-2 font-display font-bold shadow-xl animate-pulse"
              >
                <PartyPopper className="w-5 h-5" />
                Reveal Next Winner
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={showFullLeaderboard}
                variant="secondary"
                className="text-lg px-8 py-6 font-display font-bold shadow-xl"
              >
                Show Full Leaderboard
              </Button>
            )}
          </motion.div>
        )}

        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <>
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  animate={{
                    opacity: 0,
                    x: (Math.random() - 0.5) * 800,
                    y: Math.random() * -600 - 100,
                    scale: 0,
                    rotate: Math.random() * 720,
                  }}
                  transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
                  className="fixed top-1/2 left-1/2 w-3 h-3 rounded-full z-30 pointer-events-none"
                  style={{
                    backgroundColor: ["hsl(43,96%,56%)", "hsl(245,58%,51%)", "hsl(170,60%,45%)", "hsl(0,72%,51%)", "hsl(35,95%,55%)"][i % 5],
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Winner Reveals */}
        <div className="flex flex-row items-end justify-center w-full max-w-4xl mt-12 mb-8 px-4 h-auto min-h-[300px]">
          <AnimatePresence>
            {[1, 0, 2].map((podiumIdx) => {
              // Convert the display podium index (2nd, 1st, 3rd) back to rank (position 1, 0, 2)
              const rankIdx = podiumIdx;
              const entry = winners[rankIdx];
              if (!entry) return null;

              const isFirst = rankIdx === 0;
              // Check if THIS winner should be visible yet
              // revealedCount=1 means we showed 3rd place (idx 2)
              // revealedCount=2 means we showed 3rd & 2nd (idx 2, 1)
              // revealedCount=3 means we showed all (idx 2, 1, 0)
              const isVisible = rankIdx >= numWinners - revealedCount;

              if (!isVisible) {
                // Return invisible placeholder to maintain layout
                return (
                  <div key={`placeholder-${rankIdx}`} className="w-[120px] md:w-[160px] mx-2 md:mx-4" />
                );
              }

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.3, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className={`mx-2 md:mx-4 ${isFirst ? 'w-[140px] md:w-[180px] z-10' : 'w-[120px] md:w-[160px] z-0'}`}
                >
                  <WinnerCard
                    entry={entry}
                    positionIdx={rankIdx}
                    isWinner={isFirst}
                    isActive={
                      // The most recently revealed one pulses
                      rankIdx === numWinners - revealedCount
                    }
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Remaining after complete */}
        <AnimatePresence>
          {phase === "complete" && rest.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full mt-12"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {rest.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    className="bg-card rounded-2xl border p-4 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-bold text-base truncate text-primary">
                          {entry.name}
                        </h3>
                        <span className="text-xs font-bold text-muted-foreground/50">
                          #{entry.rank}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <div className="w-16 h-8 flex items-center justify-center border rounded-md font-display font-bold text-sm bg-muted/30">
                          {entry.total}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function WinnerCard({
  entry,
  positionIdx,
  isActive,
  isWinner = false,
}: {
  entry: { name: string; total?: number; score?: number; rank: number };
  positionIdx: number;
  isActive: boolean;
  isWinner?: boolean;
}) {
  const medal = getWinnerMedal(positionIdx);
  const score = entry.total !== undefined ? entry.total : entry.score;
  const heights = ["h-40 md:h-52", "h-32 md:h-44", "h-28 md:h-36"];
  const defaultHeight = "h-20 md:h-28";

  return (
    <motion.div
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
      className="flex flex-col items-center w-full"
    >
      <div className={isWinner || isActive ? "animate-trophy-bounce" : ""}>
        <span className="text-4xl md:text-5xl mb-2 block">{medal.label}</span>
      </div>
      <span className="font-display font-bold text-base md:text-lg mb-2 text-center truncate w-full px-2">
        {entry.name}
      </span>
      <div
        className={`${positionIdx < 3 ? heights[positionIdx] : defaultHeight
          } w-full rounded-t-2xl ${medal.bg} border-2 ${medal.border} flex items-center justify-center border-b-0`}
      >
        <span className={`font-display font-bold text-3xl md:text-5xl ${medal.text}`}>
          {score}
        </span>
      </div>
    </motion.div>
  );
}

