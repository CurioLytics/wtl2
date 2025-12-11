// Quiz types based on webhook response structure
export interface QuizQuestion {
    question: string;
    options: string[]; // e.g., ["A. are", "B. is", "C. were", "D. be"]
    answer: string; // e.g., "B"
    explanation: string;
}

export interface QuizData {
    questions: QuizQuestion[];
    source: string;
}

export interface WebhookResponse {
    output: QuizData;
}

export interface QuizState {
    currentQuestionIndex: number;
    selectedAnswer: string | null;
    isAnswered: boolean;
    score: number;
}
