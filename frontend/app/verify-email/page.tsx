"use client";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { authApi } from "@/services/auth";
export default function Page(){return <AuthShell title="Verify your email" detail="Enter the verification token from your secure email link to activate your MeetSpace account."><AuthForm fields={[{name:"token",label:"Verification token",autoComplete:"off"}]} submit="Verify email" successMessage="Your email has been verified. You can now sign in." onSubmit={v=>authApi.verify(v.token)}/><p className="mt-5 text-sm text-slate"><Link href="/login" className="font-semibold text-work-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-work-blue">Back to sign in</Link></p></AuthShell>;}