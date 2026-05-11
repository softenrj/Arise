import { Search } from '@/config/viewRegistry/search';
import Renderer from '@/renderer/renderer';
import React from 'react';

export default function SearchRenderer() {
    const scene = Search['search'];
    return (
        <Renderer scene={scene} />
    )
}