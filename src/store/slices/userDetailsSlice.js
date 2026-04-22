import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postAPIAuth } from "../../services/apiInstance";


export const fetchUserDetails = createAsyncThunk(
    "userDetails/fetchUserDetails",
    async (_, { getState, rejectWithValue }) => {

        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getUserDetailsAPI', {});

            if(response?.data?.success) {
                return response.data?.doc;
            } else {
                const errorMessage = response?.data?.message || "Failed to fetch user details";
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch user details";
            return rejectWithValue(errorMessage);
        }
    },
);

const initialState = {
    ParentId: null,
    parentRoll: null,
    availableEventTypes: {
        1: true,
        2: true,
        4: true,
        7: true,
        4339: true,
        c9: true,
        c1: true,
        m1: true,
        v9: true,
        b9: true,
    },
    balance: 0,
    exposure: 0,
    limit: 0,
    walletStatus: false,
    bonusRedeemed: 0, //Not Using currently..
    nonCashableAmount: 0, //Not Using currently..
    cashableAmount: 0, //Not Using currently..
    bonus: 0, //Not Using currently..
    isLoading: false,
    error: null,
};

const userDetailsSlice = createSlice({
    name: "userDetails",
    initialState,
    reducers: {
        setUserDetails: (state, action) => {
            const {
                ParentId,
                parentRoll,
                availableEventTypes,
                balance,
                exposure,
                limit,
                walletStatus,
            } = action.payload;
            state.ParentId = ParentId;
            state.parentRoll = parentRoll;
            state.availableEventTypes = availableEventTypes;
            state.balance = balance;
            state.exposure = exposure;
            state.limit = limit;
            state.walletStatus = walletStatus;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                
                const { ParentId, parentRoll, availableEventTypes, balance, exposure, limit, walletStatus } = action.payload;
                
                if (ParentId !== undefined) state.ParentId = ParentId;
                if (parentRoll !== undefined) state.parentRoll = parentRoll;
                if (availableEventTypes?.[0] !== undefined) state.availableEventTypes = availableEventTypes?.[0];
                if (balance !== undefined) state.balance = balance;
                if (exposure !== undefined) state.exposure = exposure;
                if (limit !== undefined) state.limit = limit;
                if (walletStatus !== undefined) state.walletStatus = walletStatus;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload; 
            });
    }
});

export const { setUserDetails } = userDetailsSlice.actions;
export default userDetailsSlice.reducer;
