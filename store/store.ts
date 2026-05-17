import { configureStore } from "@reduxjs/toolkit";
import TrackReducer from "./reducer/trackplayerSlice";

export const store = configureStore({
    reducer: {
        trackReducer: TrackReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch