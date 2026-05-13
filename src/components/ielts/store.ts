import { create } from 'zustand'

type ModuleStoreType = {
	answers: Record<number, string[] | undefined>
	setAnswer: (questionNum: number, answer: string[] | undefined) => void
}

export const useAnswers = create<ModuleStoreType>((set, get) => ({
	answers: {},
	setAnswer: (questionNum, answer) => set((state) => ({ answers: { ...state.answers, [questionNum]: answer } })),
}))
