'use client'

import { LoginInput, loginSchema } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { useForm } from "react-hook-form";



export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(data: LoginInput) {
        try {
            setIsLoading(true);
            const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`, data)
            localStorage.setItem("token", response.data.token);
            router.push("/dashboard");
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center gap-5 min-h-screen">
            <h1 className="text-2xl font-semibold">Login</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center justify-center flex-col gap-3">
                <div>
                    <input {...form.register("username")} placeholder="Username" className="w-full p-5 border rounded-xl" />
                    {form.formState.errors.username && (
                        <p>{form.formState.errors.username.message}</p>
                    )}
                </div>
                <div>
                    <input
                        {...form.register("password")}
                        type="password"
                        placeholder="Password"
                        className="w-full p-5 border rounded-xl"
                    />
                    {form.formState.errors.password && (
                        <p>{form.formState.errors.password.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full p-2 bg-green-700 text-white rounded hover:bg-green-600"
                >
                    {isLoading ? "Loading..." : "Login"}
                </button>
                <Link href="/register" className="block text-center text-sm text-green-700">
                    Don't have an account? <span className="text-lg font-semibold text-green-600">Register</span> 
                </Link>
            </form>
        </div>
    )
}