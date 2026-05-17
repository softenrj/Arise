import React, { createContext } from 'react';

export const MusicLibContext = createContext({
    editSheet: false,
    openSheet: () => { },
    closeSheet: () => { }
})

export default function musicLibProvider({ children }: { children: React.ReactNode }) {
    const [editSheet, setEditSheet] = React.useState<boolean>(false);

    const openSheet = () => setEditSheet(true);
    const closeSheet = () => setEditSheet(false);
    return (
        <MusicLibContext.Provider value={{ editSheet, openSheet, closeSheet }}>
            {children}
        </MusicLibContext.Provider>
    )
}