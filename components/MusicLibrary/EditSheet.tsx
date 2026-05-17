import { useMusicLib } from '@/hooks/useMusicLib';
import React from 'react';
import { ScrollView } from 'react-native';
import SheetProvider from '../ui/Sheet';

export default function EditSheet() {
    const { editSheet, closeSheet } = useMusicLib();
    return (
        <SheetProvider open={editSheet} onClose={closeSheet}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='px-5 pt-2 pb-12'
                contentContainerStyle={{ paddingBottom: 48 }}
            >

            </ScrollView>
        </SheetProvider>
    )
}