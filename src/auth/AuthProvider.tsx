"use client"

import { createContext, useContext, useState } from "react";
import {
	type User,
	type Credential,
	signup as signupAction,
	login as loginAction,
	logout as logoutAction
} from "./core"
import { UserRegister } from "@/client";
import { useRouter } from "next/navigation";

type AuthContextType = {
	user?: User;
	signup: (data: UserRegister) => Promise<void>;
	login: (cred: Credential, redirectTo?: string) => Promise<void>;
	logout: (redirectTo?: string) => Promise<void>;
	error?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);


type AuthProviderProps = {
	children: React.ReactNode,
	user?: User,
};


export function AuthProvider({ children, user: user_in }: AuthProviderProps) {
	const [error, setError] = useState<string | undefined>(undefined)
	const [user, setUser] = useState<User | undefined>(user_in);
	const router = useRouter();

	// useEffect(() => {
	// 	const loadUser = async () => {
	// 		try {
	// 			const res = await readUserMe();
	// 			setUser(res.data);
	// 			setError(undefined);
	// 		} catch {
	// 			return;
	// 		}
	// 	};
	// 	void loadUser();
	// }, [])

	const signup = async (data: UserRegister) => {
		const res = await signupAction(data);

		if(res.error){
			setError(res.error);
			throw new Error(res.error);
		}

		setError(undefined);
	}

	const login = async (cred: Credential, redirectTo?: string) => {
		const res = await loginAction(cred);

		if(res.error){
			setError(res.error);
			throw new Error(res.error);
		}

		setError(undefined);
		setUser(res.user);

		if (redirectTo) {
			router.replace(redirectTo);
		}
	}

	const logout = async (redirectTo?: string) => {
		await logoutAction();
		setUser(undefined);
		setError(undefined);
		if (redirectTo) {
			router.replace(redirectTo);
		}
	}

	return (
		<AuthContext.Provider value={{ user, signup, login, logout, error }}>
			{children}
		</AuthContext.Provider>
	)
}


export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within a AuthProvider");
	}

	return context;
}
