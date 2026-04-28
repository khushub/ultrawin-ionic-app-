import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BUTTON_VARIABLES } from "../../constants/ButtonVariable";
import { postAPIAuth } from "../../services/apiInstance";


export const fetchButtonVariables = createAsyncThunk(
    "exchBetSlip/fetchButtonVariables",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getStackButtonAPI', {});
            // console.log('resposne from getStackButtonAPI: ', response);

            // if (response?.data?.success) {
            //     return response.data.response || [];
            // } else {
            //     const errorMessage = response?.data?.message || "Failed to fetch Button Variables";
            //     return rejectWithValue(errorMessage);
            // }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch Button Variables";
            return rejectWithValue(errorMessage);
        }
    },
);



const initialState = {
    bets: [],
    openBets: [],
    totalOrders: 0,
    buttonVariables: BUTTON_VARIABLES,
    bettingInprogress: false,
    isOneClickEnable: false,
    oneClickAmount: 0,
    betStatusResponse: null,
    oneClickBettingLoading: false,
    oneClickBettingEnabled: false,
    oneClickBettingStake: 100,
    cashoutInProgress: null,
};


const exchBetSlipSlice = createSlice({
    name: "exchBetSlip",
    initialState,
    reducers: {
        addBetHandler: (state, action) => {
            if (!state.bettingInprogress) {
                state.bets.push(action.payload);
            }
        },
        removeExchangeBet: (state, action) => {
            state.bets.splice(action.payload, 1);
        },
        setExchangeBetStake: (state, action) => {
            const { index, amount, type } = action.payload;
            if (state.bets[index]) {
                if (type === "ADD") {
                    state.bets[index].amount = (state.bets[index].amount || 0) + amount;
                } else {
                    state.bets[index].amount = amount;
                }
            }
        },
        exchangeBetOddsChange: (state, action) => {
            const { index, odds } = action.payload;
            if (state.bets[index]) {
                state.bets[index].oddValue = odds;
            }
        },
        clearExchcngeBets: (state) => {
            if (!state.bettingInprogress) {
                state.bets = [];
            }
        },

        fetchOpenBetsSuccess: (state, action) => {
            state.openBets = action.payload.result;
            state.totalOrders = action.payload.totalOrders ?? 0;
        },

        addOpenBets: (state, action) => {
            state.openBets = [...state.openBets, ...action.payload];
        },

        removeOpenBetsByMarketId: (state, action) => {
            state.openBets = state.openBets.filter(
                (bet) => bet.marketId !== action.payload
            );
        },

        clearSuccessBets: (state, action) => {
            if (action.payload?.length) {
                state.bets = state.bets.filter(
                    (_, index) => !action.payload.includes(index)
                );
            } else {
                state.bets = [];
            }
        },

        setButtonVariables: (state, action) => {
            state.buttonVariables = action.payload;
        },

        setBettingInprogress: (state, action) => {
            state.bettingInprogress = action.payload;
        },

        cancelBetSuccess: (state, action) => {
            state.openBets = state.openBets.filter(
                (bet) => bet.betId !== action.payload
            );
        },

        enableOnclickBet: (state, action) => {
            state.isOneClickEnable = action.payload;
        },

        addOnclickBetAmount: (state, action) => {
            state.oneClickAmount = action.payload;
        },

        updateBetslipFromWS: (state, action) => {
            const { odds, marketId, marketType } = action.payload;
            state.bets = state.bets.map((bet) => {
                if (bet.marketId === marketId && bet.marketType === marketType) {
                    return { ...bet, oddValue: odds, oddsChanged: true };
                }
                return bet;
            });
        },

        resetOddsChangeMsg: (state, action) => {
            const index = action.payload;
            if (state.bets[index]) {
                state.bets[index].oddsChanged = false;
            }
        },

        validateOdds: (state, action) => {
            const { index, isValid } = action.payload;
            if (state.bets[index]) {
                state.bets[index].isValidOdds = isValid;
            }
        },

        fetchBetStatusInProgress: (state, action) => {
            state.betStatusResponse = action.payload;
        },

        fetchBetStatusSuccess: (state, action) => {
            state.betStatusResponse = action.payload;
        },

        fetchBetStatusFail: (state, action) => {
            state.betStatusResponse = action.payload;
        },

        clearBetStatusResponse: (state) => {
            state.betStatusResponse = null;
        },

        setOneClickBettingLoading: (state, action) => {
            state.oneClickBettingLoading = action.payload;
        },

        enableOneClickBetting: (state, action) => {
            state.oneClickBettingEnabled = action.payload;
        },

        setOneClickBettingStake: (state, action) => {
            state.oneClickBettingStake = action.payload;
        },

        setCashoutInProgress: (state, action) => {
            state.cashoutInProgress = action.payload;
        },
    }
});


export const {
    addBetHandler,
    removeExchangeBet,
    setExchangeBetStake,
    exchangeBetOddsChange,
    clearExchcngeBets,
    fetchOpenBetsSuccess,
    addOpenBets,
    removeOpenBetsByMarketId,
    clearSuccessBets,
    setButtonVariables,
    setBettingInprogress,
    cancelBetSuccess,
    enableOnclickBet,
    addOnclickBetAmount,
    updateBetslipFromWS,
    resetOddsChangeMsg,
    validateOdds,
    fetchBetStatusInProgress,
    fetchBetStatusSuccess,
    fetchBetStatusFail,
    clearBetStatusResponse,
    setOneClickBettingLoading,
    enableOneClickBetting,
    setOneClickBettingStake,
    setCashoutInProgress,
} = exchBetSlipSlice.actions;

export default exchBetSlipSlice.reducer;