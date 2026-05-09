import GetStarted from "@/components/GetStarted";
import AriseLogo from "@/components/GetStarted/Arise";
import { ComponentType } from "react";

export const sectionsRegistry: Record<string, ComponentType<any>> = {
    AriseLogo: AriseLogo,
    GetStarted: GetStarted
}