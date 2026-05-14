import { ModuleRead, Question } from "@/client";
import { createStore } from "zustand/vanilla"

export type QuestionMeta = { index: number, focused: boolean, focusCount: number }

export type ModuleStore = {
	key: string
	module: ModuleRead
	questionsMeta: Record<number, QuestionMeta>
	getQuestion: (num: number) => Question
	getQuestionIndex: (num: number) => number

	focusedQuestion: Question
	focusQuestion: (num: number) => void
	focusPrevQuestion: () => void
	focusNextQuestion: () => void

	part: number
	setPart: (part: number) => void

	answers: Record<number, string[]>
	setAnswer: (questionNum: number, answer: string[]) => void
}

export function createModuleStore(module: ModuleRead, questionsMeta: Record<number, QuestionMeta>) {
	return createStore<ModuleStore>((set, get) => ({
		key: crypto.randomUUID(),
		module,
		questionsMeta,
		getQuestion: (num: number) => get().module.questions[get().questionsMeta[num].index],
		getQuestionIndex: (num: number) => get().questionsMeta[num].index,

		part: 0,
		setPart: (part) => set(() => ({ part })),

		focusedQuestion: module.questions[0],
		focusQuestion: (num: number) => set((state) => {
			const q0 = state.getQuestion(state.focusedQuestion.num)
			const meta0 = state.questionsMeta[state.focusedQuestion.num]
			const q1 = state.getQuestion(num)
			const meta1 = state.questionsMeta[num]

			if (q1.part !== undefined) {
				state.setPart(q1.part)
			}

			return {
				focusedQuestion: q1,
				questionsMeta: {
					...state.questionsMeta,
					[q0.num]: { ...meta0, focused: false, },
					[q1.num]: { ...meta1, focused: true, focusCount: meta1.focusCount + 1 },
				}
			}
		}),

		focusPrevQuestion: () => {
			const state = get()
			let prev_index = state.getQuestionIndex(state.focusedQuestion.num) - 1
			if (prev_index < 0)
				prev_index = 0
			state.focusQuestion(state.module.questions[prev_index].num)
		},

		focusNextQuestion: () => {
			const state = get()
			let next_index = state.getQuestionIndex(state.focusedQuestion.num) + 1
			if (next_index >= state.module.questions.length)
				next_index = state.module.questions.length - 1
			state.focusQuestion(state.module.questions[next_index].num)
		},

		answers: {},
		setAnswer: (questionNum, answer) => set((state) => ({ answers: { ...state.answers, [questionNum]: answer } })),
	}))
}