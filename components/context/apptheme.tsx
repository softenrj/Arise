// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { createContext } from 'react';

export enum AppTheme {
    'light' = 'light', 'dark' = 'dark'
}
export const AppThemeContext = createContext<{ theme: AppTheme, setTheme: (theme: AppTheme) => void }>({
    theme: AppTheme.light,
    setTheme: (theme: AppTheme) => { }
})

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<AppTheme>(AppTheme.light);

    const handleSetTheme = (t: AppTheme) => setTheme(t);
    return (
        <AppThemeContext.Provider value={{ setTheme: handleSetTheme, theme }}>
            {children}
        </AppThemeContext.Provider>
    )
}