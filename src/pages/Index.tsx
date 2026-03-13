import { QuizProvider, useQuiz } from "@/context/QuizContext";
import LandingPage from "@/components/quiz/LandingPage";
import QuizDashboard from "@/components/quiz/QuizDashboard";

function QuizApp() {
  const { isSetup } = useQuiz();
  return isSetup ? <QuizDashboard /> : <LandingPage />;
}

export default function Index() {
  return (
    <QuizProvider>
      <QuizApp />
    </QuizProvider>
  );
}
