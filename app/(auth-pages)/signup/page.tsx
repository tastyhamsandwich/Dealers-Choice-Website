import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@comps/form-message";
import { SubmitButton } from "@comps/submit-button";
import { Input } from "@comps/ui/input";
import { Label } from "@comps/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../(boilerplate)/smtp-message";
import './signup.module.css';

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}


/*"use client"

import React, { useState } from 'react';
import { validateAll } from '@/lib/auth/validate';
import styles from './styles.module.css';
import { signUpAction } from '@/app/actions';

async function createUser(username: string, email: string, password: string, passconfirm: string, dob: string) {
    
    
    const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, passconfirm, dob}),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    console.log(`SIGNUP SUBMISSION:\n Data>\n   Email: ${email} | Username: ${username} | Password: ${password}\n\t\tPassconfirm: ${passconfirm} | DOB: ${dob}`);
    console.log(`JSON>\n  sssssss`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
    }

    return data;
}

export default function SignUpPage() {

    const [isVisible, setIsVisible] = useState(false);
    let formError = '';

    const toggleErrorVisibility = () => { setIsVisible(!isVisible); };

    async function submitHandler(formData: FormData) {


        //event.preventDefault();
/*
        const formUsername          = JSON.stringify(formData.get("username"));
        const formEmail             = JSON.stringify(formData.get("email"));
        const formPassword          = JSON.stringify(formData.get("password"));
        const formConfirmPassword   = JSON.stringify(formData.get("confirmPassword"));
        const formDob               = JSON.stringify(formData.get("dob"));

        const enteredFields = await validateAll(formUsername, formEmail, formPassword, formConfirmPassword, formDob);

        if (!enteredFields.valid) {
            // TODO display error messages
            formError = enteredFields.response;
            toggleErrorVisibility();

        } else {
            try {
                const result = await createUser(formUsername, formEmail, formPassword, formDob);
                console.log(result);
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#111] to-[#222255] text-white">
        <div className="input-container box-border h-128 w-100 p-4 border-4 border-slate-700 content-center">
            <h2 className="banner text-center font-semibold underline-offset-8 font-mono drop-shadow-md text-3xl">New User Registration</h2>
            <div id="signup" className="flex space-y-4">
                <form name="signupForm" className="signup justify-around"  action={signUpAction}>
                    <div className="form-item flex flex-row space-x-8 ps-5 pt-10 justify-between">
                        <div className="label-container pl-1"><label htmlFor="username">Username</label></div>
                        <div className="input-container p-1"><input className="w-50 text-white bg-slate-800" type="text" name="username" id="username" minLength={4} placeholder="Username" required autoComplete="on" /></div>
                    </div>
                    <div className="form-item flex flex-row space-x-8 ps-5 pt-5 justify-between">
                        <div className="label-container pl-1"><label htmlFor="email">Email</label></div>
                        <div className="input-container p-1"><input className="w-50 text-white bg-slate-800" type="email" name="email" id="email" placeholder="Email" required autoComplete="on" /></div>
                    </div>
                    <div className="form-item flex flex-row space-x-8 ps-5 pt-5 justify-between">
                        <div className="label-container pl-1"><label htmlFor="password">Password</label></div>
                        <div className="input-container p-1"><input className="w-50 text-white bg-slate-800" type="password" name="password" id="password" minLength={8} placeholder="Password" required /></div>
                    </div>
                    <div className="form-item flex flex-row space-x-8 ps-5 pt-5 justify-between" >
                        <div className="label-container pl-1"><label htmlFor="passconfirm">Confirm Password</label></div>
                        <div className="input-container p-1"><input className="w-50 text-white bg-slate-800" type="password" name="passconfirm" id="passconfirm" minLength={8} placeholder="Confirm Password" required /></div>
                    </div>
                    <div className="form-item flex flex-row space-x-8 ps-5 pt-5 justify-between">
                        <div className="label-container pl-1"><label htmlFor="dob">Date of Birth</label></div>
                        <div className="input-container p-1 justify-start place-content-start"><input className="place-content-start w-50 date-picker text-white bg-slate-800" type="date" name="dob" id="dob" required min="1940-01-01" max="2006-12-31" /></div>
                    </div>
                    {isVisible && <div className="error-container" id="error-container">
                        <div className="error"><small>{formError}</small></div>
                    </div>}
                    <div className="justify-center flex form-submit">
                        <button type="submit" className="text-white rounded-lg border-green-700 shadow shadow-green-500/50 hover:shadow-l active:pt-3 hover:shadow-white/50 drop-shadow-md border-4 bg-gradient-to-b from-[#33aa33] to-[#001100] px-5 py-3 mt-5 signup">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
        <div className="login pt-10">
            <h3>Already have an account? <a href="/login" className="text-green-300 font-bold text-pretty login-link hover:underline">Login</a>!</h3>
        </div>
    </div>
    )
}*/