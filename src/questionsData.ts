export type QuestionKind = "affirmation" | "question";

export type QuestionItem = { id: string; text: string; kind: QuestionKind };

export type QuestionMode = "tout" | "affirmation" | "question";

export const QUESTIONS: QuestionItem[] = [
  { id: "q1", text: "Le travail ne devrait jamais passer avant la famille.", kind: "affirmation" },
  {
    id: "q2",
    text: "Il vaut mieux gagner moins d'argent et avoir plus de temps libre.",
    kind: "affirmation",
  },
  {
    id: "q3",
    text: "Pour réussir, il faut parfois sacrifier sa vie personnelle.",
    kind: "affirmation",
  },
  { id: "q4", text: "Le télétravail améliore toujours la qualité de vie.", kind: "affirmation" },
  {
    id: "q5",
    text: "Choisir son métier est l'une des décisions les plus importantes de la vie.",
    kind: "affirmation",
  },
  { id: "q6", text: "On peut réussir sans faire de longues études.", kind: "affirmation" },
  {
    id: "q7",
    text: "Il est normal de changer plusieurs fois d'orientation ou de métier au cours de sa vie.",
    kind: "affirmation",
  },
  { id: "q8", text: "Se reposer n'est pas une perte de temps.", kind: "affirmation" },
  {
    id: "q9",
    text: "Le succès signifie une chose différente pour chaque personne.",
    kind: "affirmation",
  },
  { id: "q10", text: "Être toujours disponible est devenu normal.", kind: "affirmation" },
  { id: "q11", text: "La charge mentale pèse plus que le travail lui-même.", kind: "affirmation" },
  {
    id: "q12",
    text: "Peut-on réellement trouver un équilibre entre vie pro et vie perso ?",
    kind: "question",
  },
  { id: "q13", text: "En ce moment, tu te sens plutôt équilibrée ou débordée ?", kind: "question" },
  { id: "q14", text: "Qu'est-ce qui prend le plus de place dans ta semaine ?", kind: "question" },
  {
    id: "q15",
    text: "Qu'est-ce qui t'aide à récupérer après une journée chargée ?",
    kind: "question",
  },
  {
    id: "q16",
    text: "Le télétravail te semble plutôt positif ou plutôt compliqué ?",
    kind: "question",
  },
  { id: "q17", text: "Tu as l'impression de mieux gérer ton temps qu'avant ?", kind: "question" },
  {
    id: "q18",
    text: "Qu'est-ce qui crée le plus de fatigue : le travail lui-même ou la charge mentale ?",
    kind: "question",
  },
  { id: "q19", text: "Est-ce que tu te sens parfois coupable de te reposer ?", kind: "question" },
  {
    id: "q20",
    text: "Peut-on vraiment séparer vie pro et vie perso aujourd'hui ?",
    kind: "question",
  },
  { id: "q21", text: "Qu'est-ce qu'une « bonne » organisation pour toi ?", kind: "question" },
  {
    id: "q22",
    text: "Quelle place devrait occuper le travail dans une vie équilibrée ?",
    kind: "question",
  },
];

export function getQuestionsByMode(mode: QuestionMode): QuestionItem[] {
  if (mode === "tout") {
    return QUESTIONS;
  }
  return QUESTIONS.filter((question) => question.kind === mode);
}
