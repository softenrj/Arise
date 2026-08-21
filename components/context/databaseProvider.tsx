// Copyright (c) 2026 Raj
// See LICENSE for details.

import { setDatabase } from "@/service/database-instance";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";

export function DatabaseInitializer({ children }: { children: React.ReactNode }) {
    const db = useSQLiteContext();

    React.useEffect(() => {
        setDatabase(db);
    }, [db]);

    return <>{children}</>;
}