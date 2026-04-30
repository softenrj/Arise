import LandingPage from "@/components/LandingPage";
import AriseLogo from "@/components/LandingPage/AriseLogo";
import { ComponentType } from "react";

export const sectionsRegistry: Record<string, ComponentType<any>> = {
    AriseLogo: AriseLogo,
    LandingPage: LandingPage
}