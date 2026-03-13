import { useQuiz } from "@/context/QuizContext";
import { motion, AnimatePresence } from "framer-motion";

const medalConfig = [
  { bg: "bg-gold/20", text: "text-gold" },
  { bg: "bg-silver/20", text: "text-silver" },
  { bg: "bg-bronze/20", text: "text-bronze" },
];

export default function RoundLeaderboard({ round }: { round: number }) {
  const { getRoundLeaderboard } = useQuiz();
  const leaderboard = getRoundLeaderboard(round);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/50">
        <h3 className="font-display font-semibold text-sm">Round {round + 1} Standings</h3>
      </div>
      <div className="grid grid-cols-[3rem_1fr_auto] gap-0 text-sm font-medium px-4 py-2 border-b text-muted-foreground">
        <span>Rank</span>
        <span>Group</span>
        <span className="w-20 text-center">Score</span>
      </div>
      <AnimatePresence mode="popLayout">
        {leaderboard.map((entry, idx) => {
          const medal = idx < 3 ? medalConfig[idx] : null;
          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`grid grid-cols-[3rem_1fr_auto] gap-0 items-center px-4 py-2.5 border-b last:border-b-0 ${
                medal ? medal.bg : "hover:bg-quiz-surface/50"
              } transition-colors`}
            >
              <span className={`font-display font-bold text-base ${medal ? medal.text : "text-muted-foreground"}`}>
                #{entry.rank}
              </span>
              <span className="font-display font-semibold truncate pr-2 text-sm">{entry.name}</span>
              <span className="w-20 text-center font-display font-bold text-lg">{entry.roundScore}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
