// Adapted from Moodle course 25, Week 1, activities 479 and 483–485.
// Learner-facing questions and feedback only. See docs/course-demo.md for revisions.
export interface DemoOption { text: string; correct: boolean; feedback: string }
export interface DemoQuestion { id: string; prompt: string; options: DemoOption[]; explanation: string; hint: string }
import { warmupQuestions } from './warmupQuestions';
import { typesQuestions } from './typesQuestions';
import { choicesQuestions } from './choicesQuestions';
import { finalQuestions } from './finalQuestions';

export const questionSets = { warmup: warmupQuestions, types: typesQuestions, choices: choicesQuestions, final: finalQuestions };
