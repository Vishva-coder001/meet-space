"use client";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { authApi } from "@/services/auth";
export default function Page(){return <AuthShell title="Reset your password" detail="Enter the email address registered to your account and we’ll send reset instructions if an active account exists."><AuthForm fields={[{name:"email",label:"Email",type:"email",autoComplete:"email"}]} submit="Send reset link" successMessage="If an active account exists for this email, reset instructions have been sent." onSubmit={v=>authApi.forgot(v.email)}/><p className="mt-5 text-sm text-slate"><Link href="/login" className="font-semibold text-work-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-work-blue">Back to sign in</Link></p></AuthShell>;}