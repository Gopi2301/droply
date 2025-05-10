"use client"
import type {ThemeProviderProps} from 'next-themes';
import {ImageKitProvider} from "imagekitio-next"
import { HeroUIProvider } from '@heroui/system';
export interface ProvidersProps {
    children: React.ReactNode,
    themeProps?: ThemeProviderProps
}
const authenticator = async ()=>{
    try {
        const response = await fetch("/api/imagekit_auth");
        const data = await response.json();
        return data
    } catch (error) {
        console.error("Authentication error", error);
        throw error
    }
}
export function Providers ({children}: ProvidersProps) {
    return(
            <ImageKitProvider 
                authenticator={authenticator} 
                publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""}
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ""}
            >
                <HeroUIProvider>
                    {children} 
                </HeroUIProvider>
            </ImageKitProvider>
    )
}