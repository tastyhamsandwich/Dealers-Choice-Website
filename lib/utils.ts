import { redirect } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const one_day = 60 * 60 * 24;

export const EmailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: true,
	path: '/',
	maxAge: one_day
} as const;

export const testIsEmail = (email: string) => {
  return EmailRegExp.test(email);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}