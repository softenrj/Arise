import { Section } from "@/types/screenMap"

export const Primary: Record<string, Section> = {
    'landing-page': {
        key: 'LandingPage',
        children: [{
            key: 'AriseLogo',
            props: {
                title: "Arise Raj"
            },
        },
        {
            key: 'AriseBackground',
        }]
    }
}