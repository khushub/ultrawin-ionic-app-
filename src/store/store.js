import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore } from "redux-persist";
import { rootReducer } from "./rootReducer";
import { setStoreReference } from "../services/axiosInstance";
// import baseApi from "./api/baseApi";
// import { authMiddleware } from "./middleware/authMiddleware";

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                ],
            },
        }),
            // .prepend(authMiddleware.middleware)
            // .concat(baseApi.middleware),
    devTools: import.meta.env.MODE !== "production",
});

setupListeners(store.dispatch);
setStoreReference(store);
export const persistor = persistStore(store);
export default store;
