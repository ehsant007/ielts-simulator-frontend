import { ModuleRead, Question } from "@/client";
import { createStore } from "zustand/vanilla"

export type QuestionMeta = { index: number, focused: boolean }

export type ModuleStore = {
	module: ModuleRead
	questionsMeta: Record<number, QuestionMeta>
	getQuestion: (num: number) => Question
	getQuestionIndex: (num: number) => number

	questionRefs: Map<number, HTMLElement | null>
	registerQuestionRef: (questionNum: number, el: HTMLElement) => void

	focusedQuestion: Question
	focusQuestion: (num: number, force?: boolean) => void
	focusPrevQuestion: () => void
	focusNextQuestion: () => void

	part: number
	setPart: (part: number) => void

	answers: Record<number, string[] | undefined>
	setAnswer: (questionNum: number, answer: string[] | undefined) => void
}

export function createModuleStore(module: ModuleRead, questionsMeta: Record<number, QuestionMeta>) {
	return createStore<ModuleStore>((set, get) => ({
		module,
		questionsMeta,
		getQuestion: (num: number) => get().module.questions[questionsMeta[num].index],
		getQuestionIndex: (num: number) => get().questionsMeta[num].index,

		questionRefs: new Map<number, HTMLElement | null>(),
		registerQuestionRef: (questionNum, el) => get().questionRefs.set(questionNum, el),

		part: 0,
		setPart: (part) => set(() => ({ part })),

		focusedQuestion: module.questions[0],
		focusQuestion: (num: number, force: boolean = false) => {
			const s = get()
			const q0 = s.getQuestion(s.focusedQuestion.num)
			const meta0 = s.questionsMeta[num]
			const q1 = s.getQuestion(num)
			const meta1 = s.questionsMeta[num]

			if (q1.part !== undefined) {
				get().setPart(q1.part)
			}

			set(() => ({
				focusedQuestion: q1,
				questionsMeta: {
					...questionsMeta,
					[q0.num]: { ...meta0, focused: false },
					[q1.num]: { ...meta1, focused: true },
				}

			}))
		},

		focusPrevQuestion: () => {
			const state = get()
			let prev_index = state.getQuestionIndex(state.focusedQuestion.num) - 1
			if (prev_index < 0)
				prev_index = 0
			state.focusQuestion(module.questions[prev_index].num)
		},

		focusNextQuestion: () => {
			const state = get()
			let next_index = state.getQuestionIndex(state.focusedQuestion.num) + 1
			if (next_index >= module.questions.length)
				next_index = module.questions.length - 1
			state.focusQuestion(module.questions[next_index].num)
		},

		answers: {},
		setAnswer: (questionNum, answer) => set((state) => ({ answers: { ...state.answers, [questionNum]: answer } })),
	}))
}