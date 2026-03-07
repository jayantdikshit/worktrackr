import { createSlice } from '@reduxjs/toolkit';

const getSafeUserData = () => {
    try {
        const user = localStorage.getItem('user');
        if (user && user !== "undefined") return JSON.parse(user);
    } catch (err) {
        console.error("Local storage parse error", err);
    }
    return null;
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: getSafeUserData(),
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token'),
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            const userData = {
                id: action.payload.id,
                name: action.payload.name,
                email: action.payload.email,
                role: action.payload.role
            };
            state.user = userData;
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(userData));
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;