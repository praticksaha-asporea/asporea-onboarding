declare module "react-simple-captcha" {
    import { ComponentType } from "react";

    export const LoadCanvasTemplate: ComponentType<{
        reloadText?: string;
        reloadColor?: string;
    }>;

    export function loadCaptchaEnginge(
        numberOfCharacters?: number
    ): void;

    export function validateCaptcha(
        userInput: string
    ): boolean;
}