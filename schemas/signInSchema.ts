import * as z from 'zod';

export const signUpSchema = z.object({
    identifier: z
        .string()
        .min(1, {message: "Email  is reqiured."})
        .email({message: "Please enter a valid email address."}),
        password: z
        .string()
        .min(1, {message: "password is required."})
        .min(8, {message: "Password must be at least 8 characters long."})
})