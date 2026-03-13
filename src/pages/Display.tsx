import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Crown } from "lucide-react";
import { WinnerCard } from "../components/quiz/FinalLeaderboard";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

interface DisplayData {
  type: "round" | "sub-round" | "final";
  round?: number;
  subRound?: number;
  groups: { id: string; name: string; score: number; rank: number }[];
  numWinners?: number;
  phase?: "idle" | "revealing" | "complete";
  revealedCount?: number;
  showConfetti?: boolean;
}

const medalConfig = [
  { bg: "bg-gold/20", border: "border-gold", text: "text-gold", icon: Trophy, label: "🥇" },
  { bg: "bg-silver/20", border: "border-silver", text: "text-silver", icon: Medal, label: "🥈" },
  { bg: "bg-bronze/20", border: "border-bronze", text: "text-bronze", icon: Award, label: "🥉" },
];

export default function Display() {
  const [data, setData] = useState<DisplayData | null>(null);

  useEffect(() => {
    const displayRef = ref(db, "quiz-display");
    const connectedRef = ref(db, ".info/connected");

    // Listen for connection status
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log("Display: Connected to Firebase Realtime Database");
      } else {
        console.warn("Display: Disconnected from Firebase");
      }
    });
    
    // Listen for real-time updates from Firebase
    const unsubscribe = onValue(displayRef, (snapshot) => {
      const val = snapshot.val();
      console.log("Display: Received update from Firebase:", val);
      if (val) {
        setData(val);
      } else {
        setData(null);
      }
    }, (error) => {
      console.error("Display: Firebase Listener Error:", error);
    });

    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">QuizMaster Live</h1>
          <p className="text-xl text-muted-foreground">Waiting for host to share a view...</p>
          <p className="text-sm text-muted-foreground">Keep this tab open on the projector</p>
        </div>
      </div>
    );
  }

  const isFinal = data.type === "final";
  const numWinners = data.numWinners || 3;
  const winners = data.groups.slice(0, isFinal ? numWinners : 3);
  const rest = data.groups.slice(isFinal ? numWinners : 3);

  if (isFinal && data.phase) {
    const { phase, revealedCount = 0, showConfetti = false } = data;

    // We reverse so that the LAST winner revealed is index 0 (the champion)
    // Actually we reveal from position numWinners down to 1
    const revealedPositions: number[] = [];
    for (let i = 0; i < revealedCount; i++) {
      revealedPositions.push(numWinners - 1 - i);
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12 overflow-auto">
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
            Combined Scores
          </p>
        </motion.div>

        {phase === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-2xl text-muted-foreground animate-pulse mt-4">
              Waiting for host to review and reveal...
            </p>
          </motion.div>
        )}

        {phase === "revealing" && revealedCount === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-10">
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-4xl md:text-6xl font-display font-bold text-primary"
            >
              🥁 Drum Roll... 🥁
            </motion.p>
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
                    entry={{ name: entry.name, score: entry.score, rank: entry.rank }}
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
                          {entry.score}
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
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {isFinal ? (
            <>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-2">
                🏆 Final Results
              </h1>
              <p className="text-xl text-muted-foreground">Combined Scores</p>
            </>
          ) : data.type === "sub-round" ? (
            <>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-2">
                Round {(data.round || 0) + 1}
              </h1>
              <p className="text-xl text-muted-foreground">Sub-Round {(data.subRound || 0) + 1} Standings</p>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-2">
                Round {(data.round || 0) + 1}
              </h1>
              <p className="text-xl text-muted-foreground">Round Leaderboard (Total)</p>
            </>
          )}
        </motion.div>

        {/* Podium for top entries */}
        {winners.length >= 3 && (
          <div className="flex justify-center items-end gap-3 md:gap-6 mb-10">
            {[1, 0, 2].map((podiumIdx) => {
              const entry = winners[podiumIdx];
              if (!entry) return null;
              const medal = medalConfig[podiumIdx];
              const heights = ["h-40 md:h-52", "h-32 md:h-44", "h-28 md:h-36"];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: podiumIdx * 0.2, type: "spring" }}
                  className="flex flex-col items-center"
                >
                  {podiumIdx === 0 && isFinal && (
                    <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <Crown className="w-10 h-10 text-gold mb-1" />
                    </motion.div>
                  )}
                  <span className={`text-4xl md:text-5xl mb-2 ${podiumIdx === 0 ? "animate-trophy-bounce" : ""}`}>
                    {medal.label}
                  </span>
                  <span className="font-display font-bold text-sm md:text-lg mb-1 text-center truncate max-w-[120px] md:max-w-[160px]">
                    {entry.name}
                  </span>
                  <div
                    className={`${heights[podiumIdx]} w-24 md:w-32 rounded-t-2xl ${medal.bg} border-2 ${medal.border} flex items-center justify-center`}
                  >
                    <span className={`font-display font-bold text-3xl md:text-4xl ${medal.text}`}>
                      {entry.score}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full Ranking Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {data.groups.map((entry, idx) => {
              const medal = idx < 3 ? medalConfig[idx] : null;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`bg-card rounded-2xl p-4 ${medal ? `border-2 ${medal.border} ${medal.bg} shadow-sm` : "border hover:shadow-md transition-shadow"
                    } relative overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-display font-bold text-base truncate ${medal ? medal.text : "text-primary"}`}>
                        {entry.name}
                      </h3>
                      {medal && (
                        <span className="text-xl" title={`Rank #${entry.rank}`}>
                          {medal.label}
                        </span>
                      )}
                      {!medal && (
                        <span className="text-xs font-bold text-muted-foreground/50">
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Score</span>
                      <div className="w-16 h-8 flex items-center justify-center border rounded-md font-display font-bold text-sm bg-muted/30">
                        {entry.score}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
