import { Primary } from '@/config/viewRegistry/primary';
import Renderer from '@/renderer/renderer';
import React from 'react';

const LandingPage = () => {
    const scene = Primary['landing-page'];
    return (
        <Renderer scene={scene} />
    )
}

export default LandingPage