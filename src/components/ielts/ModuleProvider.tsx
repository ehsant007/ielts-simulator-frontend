"use client"

import { createContext, Dispatch, RefObject, SetStateAction, useContext, useEffect, useMemo, useState } from "react";
import { ModuleRead, Question } from "@/client";

type ModuleContextType = {
	module: ModuleRead
	part: number
	setPart: Dispatch<SetStateAction<number>>
	focusedQuestion: Question
	focusQuestion: (num: number | Question, force?: boolean) => void
	focusPrevQuestion: () => void
	focusNextQuestion: () => void
	tick: number
	getQuestion: (num: number) => Question
	setQuestionRef: (question: Question, ref: RefObject<any>) => void
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined)

type ModuleContextProviderProps = {
	children: React.ReactNode,
	module: ModuleRead
}

export function ModuleContextProvider({ children, module }: ModuleContextProviderProps) {
	const [part, setPart] = useState<number>(0)
	const [focusedQuestion, _focusQuestion] = useState<Question>(module.questions[0])
	const [tick, setTick] = useState<number>(0)

	console.log("ModuleProvider")

	useEffect(() => {
		const ref = questions_map[focusedQuestion.num].ref
		if (!ref) {
			return
		}
		ref.current?.scrollIntoView({
			behavior: "smooth",
			block: "center",
		})

		ref.current?.focus()
	}, [focusedQuestion, tick])


	const questions_map = useMemo(() => {
		const map: { [key: number]: { question: Question; index: number; ref: RefObject<any> | null } } = {}
		module.questions.forEach((question, index) => {
			map[question.num] = {
				question,
				index,
				ref: null,
			}
		})

		return map
	}, [module])

	//const questions_map: { [key: number]: { question: Question; index: number; ref: RefObject<any> | null } } = {}
	//module.questions.forEach((question, index) => questions_map[question.num] = { question, index, ref: null })

	const setQuestionRef = (question: Question, ref: RefObject<any>) => {
		console.log(`question ${question.num} ref was set`)
		questions_map[question.num].ref = ref
	}

	const getQuestion = (num: number) => questions_map[num].question
	const getQuestionIndex = (question: Question) => questions_map[question.num].index

	const focusQuestion = (question: number | Question, force: boolean = false) => {
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
	}

	const focusPrevQuestion = () => {
		let prev_index = getQuestionIndex(focusedQuestion) - 1
		if (prev_index < 0)
			prev_index = 0
		focusQuestion(module.questions[prev_index])
	}

	const focusNextQuestion = () => {
		let next_index = getQuestionIndex(focusedQuestion) + 1
		if (next_index >= module.questions.length)
			next_index = module.questions.length - 1
		focusQuestion(module.questions[next_index])
	}

	return <ModuleContext.Provider value={{ module, part, setPart, focusedQuestion, focusQuestion, tick, focusPrevQuestion, focusNextQuestion, getQuestion, setQuestionRef }}>
		{children}
	</ModuleContext.Provider>
}

export function useModule() {
	const context = useContext(ModuleContext)
	if (!context) {
		throw new Error("useModule must be used within a ModuleContextProvider");
	}

	return context;
}
