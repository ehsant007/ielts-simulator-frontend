import { FieldValues, RegisterOptions } from "react-hook-form"
import type { UserRegister } from "./client"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Invalid name",
}

export const usernamePattern = {
  value: /^[a-zA-Z0-9](?:[._-]?[a-zA-Z0-9])*$/,
  message: "Username can only contain letters, numbers, dots, underscores, or hyphens, and must start with a letter or number",
};

export interface UserRegisterForm extends UserRegister {
	confirm_password: string
}

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  }

  if (isRequired) {
    rules.required = "Password is required"
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => FieldValues,
  isRequired = true,
) => {
  const rules: RegisterOptions<UserRegisterForm, "confirm_password"> = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "The passwords do not match"
    },
  }

  if (isRequired) {
    rules.required = "Password confirmation is required"
  }

  return rules
}
