import { createSlice } from '@reduxjs/toolkit'
import { storageManager } from '../../util/storageManager';


const initialState = {
    user: storageManager.getUser(),
    token: storageManager.getToken(),
    loggedIn: Boolean(storageManager.getToken()),
    loading: false,
    loginError: '',
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        requestStart: (state) => {
            state.loading = true;
            state.loginError = '';
        },
        requestEnd: (state) => {
            state.loading = false;
        },
        loginSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.loggedIn = true;
            state.loading = false;
            state.loginError = '';
            storageManager.setToken(token)
            storageManager.setUser(user)
        },
        loginFailed: (state, action) => {
            state.loggedIn = false;
            state.user = null;
            state.token = null;
            state.loading = false;
            state.loginError = action.payload;
        },
        logout: (state) => {
            console.log('hit');
            state.user = null;
            state.token = null;
            state.loggedIn = false;
            storageManager.clearAuth()
        },
    },
})

export const { 
    loginSuccess,
    loginFailed,
    logout,
    requestStart,
    requestEnd
} = authSlice.actions;
export default authSlice.reducer;
