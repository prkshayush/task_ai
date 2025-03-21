'use client'

import { RegisterInput, registerSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";


export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    })

    async function onSubmit(data: RegisterInput) {
        try {
            setIsLoading(true)
            setError("")

            const payload = {
                username: data.username.trim(),
                password: data.password
            }
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            router.push("/login")
        } catch (error: any) {
            console.error('Registration Error: ', {
                status: error.response?.status,
                message: error.response?.data?.message
            })
            setError(error.response?.data?.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center gap-5 min-h-screen">
            <h1 className="text-2xl font-semibold">Register</h1>
            {error && (
                <div className="w-full p-3 rounded-lg text-md">
                    {error}
                </div>
            )}
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