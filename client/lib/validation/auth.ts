import * as z from "zod";

export const loginSchema = z.object({
    username: z.string().min(4, "Username must be at least 4 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = loginSchema.extend({
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;