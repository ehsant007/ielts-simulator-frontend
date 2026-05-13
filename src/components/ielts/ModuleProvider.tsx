"use client"

import { createContext, Dispatch, RefObject, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ModuleRead, Question } from "@/client";
import { createStore } from "zustand/vanilla"
import { useStore } from "zustand";

type ModuleContextType = {
	module: ModuleRead
	getQuestion: (num: number) => Question
	registerQuestionRef: (questionNum: number, el: HTMLElement) => void
}

type QuestionFocusContextType = {
	focusedQuestion: Question
	focusQuestion: (num: number | Question, force?: boolean) => void
	focusPrevQuestion: () => void
	focusNextQuestion: () => void
	tick: number
}

type ModulePartContextType = {
	part: number
	setPart: Dispatch<SetStateAction<number>>
}



type ModuleStoreType = {
	answers: Record<number, string[] | undefined>
	setAnswer: (questionNum: number, answer: string[] | undefined) => void
}

export function createModuleStore() {
	return createStore<ModuleStoreType>((set) => ({
		answers: {},
		setAnswer: (questionNum, answer) => set((state) => ({ answers: { ...state.answers, [questionNum]: answer } })),
	}))
}



const ModuleContext = createContext<ModuleContextType | undefined>(undefined)
const QuestionFocusContext = createContext<QuestionFocusContextType | undefined>(undefined)
const ModulePartContext = createContext<ModulePartContextType | undefined>(undefined)
const AnswersContext = createContext<ReturnType<typeof createModuleStore> | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead
}

export function ModuleContextProvider({ children, module }: ModuleContextProviderProps) {
	const [part, setPart] = useState<number>(0)
	const [focusedQuestion, _focusQuestion] = useState<Question>(module.questions[0])
	const [tick, setTick] = useState<number>(0)
	const questionRefs = useRef(new Map<number, HTMLElement | null>())
	const store = useRef<ReturnType<typeof createModuleStore> | undefined>(undefined)

	if (!store.current) {
		store.current = createModuleStore()
	}

	console.log("ModuleProvider")

	useEffect(() => {
		const el = questionRefs.current?.get(focusedQuestion.num)
		if (!el)
			return

		el.scrollIntoView({
			behavior: "smooth",
			block: "center",
		})

		el.focus()
	}, [focusedQuestion, tick])

	const questions_map = useMemo(() => {
		const map: { [key: number]: { question: Question; index: number; } } = {}
		module.questions.forEach((question, index) => {
			map[question.num] = {
				question,
				index
			}
		})

		return map
	}, [module])

	const registerQuestionRef = useCallback((questionNum: number, el: HTMLElement | null) => {
		console.log(`question ${questionNum} ref was set to ${el}`)
		questionRefs.current.set(questionNum, el)
	}, [])

	const getQuestion = useCallback((num: number) => questions_map[num].question, [questions_map])
	const getQuestionIndex = useCallback((question: Question) => questions_map[question.num].index, [questions_map])

	const focusQuestion = useCallback((question: number | Question, force: boolean = false) => {
		let q: Question
		if (typeof question === "number")
			q = getQuestion(question)
		else
			q = getQuestion(question.num)

		_focusQuestion(q)

		if (q.part !== undefined) {
			setPart(q.part)
		}

		if (force) {
			setTick(prev => prev + 1)
		}
	}, [getQuestion])

	const focusPrevQuestion = useCallback(() => {
		let prev_index = getQuestionIndex(focusedQuestion) - 1
		if (prev_index < 0)
			prev_index = 0
		focusQuestion(module.questions[prev_index])
	}, [focusedQuestion, getQuestionIndex, focusQuestion, module.questions])

	const focusNextQuestion = useCallback(() => {
		let next_index = getQuestionIndex(focusedQuestion) + 1
		if (next_index >= module.questions.length)
			next_index = module.questions.length - 1
		focusQuestion(module.questions[next_index])
	}, [focusedQuestion, getQuestionIndex, focusQuestion, module.questions])


	// Context values

	const module_context = useMemo(() => ({
		module,
		getQuestion,
		registerQuestionRef
	}), [module, getQuestion, registerQuestionRef])

	const focus_context = useMemo(() => ({
		focusedQuestion,
		tick,
		focusQuestion,
		focusPrevQuestion,
		focusNextQuestion
	}), [focusQuestion, tick, focusQuestion, focusPrevQuestion, focusNextQuestion])

	const part_context = useMemo(() => ({
		part,
		setPart
	}), [part])

	return <ModuleContext.Provider value={module_context}>
		<ModulePartContext.Provider value={part_context}>
			<QuestionFocusContext.Provider value={focus_context} >
				<AnswersContext.Provider value={store.current} >
					{children}
				</AnswersContext.Provider>
			</QuestionFocusContext.Provider>
		</ModulePartContext.Provider>
	</ModuleContext.Provider>
}

export function useModule() {
	const context = useContext(ModuleContext)
	if (!context) {
		throw new Error("useModule must be used within a ModuleContextProvider");
	}

	return context;
}

export function useQuestionFucus() {
	const context = useContext(QuestionFocusContext)
	if (!context) {
		throw new Error("useQuestionFucus must be used within a ModuleContextProvider");
	}

	return context;
}

export function usePart() {
	const context = useContext(ModulePartContext)
	if (!context) {
		throw new Error("usePart must be used within a ModuleContextProvider");
	}

	return context;
}

export function useModuleStore<T>(selector: (state: ModuleStoreType) => T) {
	const store = useContext(AnswersContext)
	if (!store) {
		throw new Error("useAnswers must be used within a ModuleContextProvider");
	}

	return useStore(store, selector);
}
