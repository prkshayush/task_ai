'use client'

import { api } from "@/lib/api";
import { RegisterInput, registerSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";


export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterInput) {
        try {
            setIsLoading(true)
            await api.post("/register", {
                username: data.username,
                password: data.password,
            });
            router.push("/login")
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center gap-5 min-h-screen">
            <h1 className="text-2xl font-semibold">Register</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center justify-center flex-col gap-3">
                <div>
                    <input {...form.register("username")} placeholder="Username" className="w-full p-5 border rounded-xl" />
                    {form.formState.errors.username && (
                        <p>{form.formState.errors.username.message}</p>
                    )}
                </div>
                <div>
                    <input
                        {...form.register("password")} type="password" placeholder="Password" className="w-full p-5 border rounded-xl" />
                    {form.formState.errors.password && (
                        <p>{form.formState.errors.password.message}</p>
                    )}
                </div>
                <div>
                    <input
                        {...form.register("confirmPassword")}
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full p-5 border rounded-xl"
                    />
                    {form.formState.errors.confirmPassword && (
                        <p>{form.formState.errors.confirmPassword.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-2 bg-blue-500 text-white rounded"
                >
                    {isLoading ? "Loading..." : "Register"}
                </button>
                <Link href="/login" className="block text-center text-sm text-blue-400">
                    Already have an account? <span className="text-lg font-semibold">Login</span> 
                </Link>
            </form>
        </div>
    )
}