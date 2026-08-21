// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { SQLiteDatabase } from "expo-sqlite";

let database: SQLiteDatabase | null = null;

export function setDatabase(db: SQLiteDatabase) {
    database = db;
}

export function getDatabase(): SQLiteDatabase {
    if (database === null) {
        throw new Error("Database has not been initialized");
    }

    return database;
}