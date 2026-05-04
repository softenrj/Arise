import React from 'react';
import { Text, View } from 'react-native';
import SheetProvider from '../ui/Sheet';

export default function TermAndConditionSheet({ open, onClose }: { open: boolean, onClose: () => void }) {
    return (
        <SheetProvider open={open} onClose={onClose}>
            <View>
                <Text className='text-2xl font-elms-m mt-4 text-black'>Terms & Conditions</Text>
            </View>
        </SheetProvider>
    )
}