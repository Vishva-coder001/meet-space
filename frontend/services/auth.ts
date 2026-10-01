import {apiClient, type ApiResult} from "./api";
export interface AuthUser { id: string; email: string; role: "EMPLOYEE" | "ADMIN" | string; emailVerified: boolean; }
export const authApi={
  register:(body:unknown)=>apiClient.post("/api/auth/register",body),
  login:(body:unknown)=>apiClient.post<{user: AuthUser}>("/api/auth/login",body),
  logout:()=>apiClient.post<void>("/api/auth/logout"),
  me:()=>apiClient.get<AuthUser>("/api/auth/me"),
  verify:(token:string)=>apiClient.post("/api/auth/verify-email",{token}),
  forgot:(email:string)=>apiClient.post("/api/auth/forgot-password",{email}),
  reset:(token:string,password:string)=>apiClient.post("/api/auth/reset-password",{token,password})
};