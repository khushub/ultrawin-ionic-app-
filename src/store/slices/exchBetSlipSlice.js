import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BUTTON_VARIABLES } from "../../constants/ButtonVariable";
import { postAPIAuth } from "../../services/apiInstance";
import { setAlertMsg } from "./commonSlice";
import { ValidateOdds } from "../../util/stringUtil";


export const oneClickBetPlaceHandler = createAsyncThunk(
    "exchBetSlip/oneClickBetPlace",
    /**
   * @param {{ bets: any[], langData: any, eventData: any }} arg
   */
    async ({ bets, langData, eventData }, { dispatch, getState }) => {
        const { oneClickBettingStake } = getState().exchBetSlip;
        const { loggedIn } = getState().auth;

        const dispatchError = (message) => {
            dispatch(setAlertMsg({ type: "error", message }));
        };

        // ── Auth check ───────────────────────────────────────────────────────────
        if (!loggedIn) {
            dispatchError(langData?.["login_to_place_bet_txt"]);
            return false;
        }

        // ── Stake check ──────────────────────────────────────────────────────────
        if (oneClickBettingStake < 1) {
            dispatchError(langData?.["minimum_stake_required_txt"]);
            return false;
        }

        // ── Odds validation ──────────────────────────────────────────────────────
        if (ValidateOdds(eventData, bets)) {
            dispatchError(langData?.["wrong_odds_txt"]);
            return false;
        }

        // ── Odd limit check ──────────────────────────────────────────────────────
        const bet = bets[0];
        if (+bet.oddLimt) {
            let limitBreached = false;
            switch (bet.marketType) {
                case "MO":
                    limitBreached = bet.oddValue > +bet.oddLimt;
                    break;
                case "BM":
                    limitBreached = (bet.oddValue + 100) / 100 > +bet.oddLimt;
                    break;
                case "FANCY":
                    limitBreached = bet.oddValue / 100 + 1 > +bet.oddLimt;
                    break;
            }
            if (limitBreached) {
                dispatchError(
                    `${langData?.["bet_rate_not_accepted_txt"]} ${bet.oddLimt}`,
                );
                return false;
            }
        }

        // ── Min/max stake check ──────────────────────────────────────────────────
        if (
            (bet.minStake !== 0 && bet.minStake > oneClickBettingStake) ||
            (bet.maxStake !== 0 && bet.maxStake < oneClickBettingStake)
        ) {
            dispatchError(
                `${langData?.["minimum_stake_txt"]} ${bet.minStake} ${langData?.["maximum_stake_txt"]} ${bet.maxStake}`,
            );
            return false;
        }

        // ── Odd value check ──────────────────────────────────────────────────────
        if (!bet.oddValue) {
            dispatchError(langData?.["invalid_odds_txt"]);
            return false;
        }

        // ── Cancel existing unmatched bet if editing ─────────────────────────────
        for (const data of bets) {
            if (data.betId) {
                try {
                    const cancelResponse = await postAPIAuth("/bs/cancel-sap-bet", {
                        cancelBets: [{ betId: data.betId, cancelSize: 0 }],
                        marketId: data.marketId,
                        eventId: data.eventId,
                        sportId: data.sportId,
                        seriesId: data.seriesId,
                        providerId: PROVIDER_ID,
                    });

                    if (cancelResponse?.data?.status !== "RS_OK") {
                        dispatchError(langData?.["cancel_old_bet_failed_txt"]);
                        return false;
                    }
                } catch {
                    dispatchError(langData?.["cancel_bet_failed_txt"]);
                    return false;
                }
            }
        }

        // ── Resolve API URL ──────────────────────────────────────────────────────
        const urlMap = {
            MO: "/place-matchodds-bet",
            BM: "/place-bookmaker-bet",
            FANCY: "/place-fancy-bet",
            PREMIUM: "/place-premium-bet",
        };
        const url = urlMap[bet.marketType];
        if (!url) {
            dispatchError(langData?.["general_err_txt"]);
            return false;
        }

        // ── Place bet ────────────────────────────────────────────────────────────
        try {
            const response = await postAPIAuth(`/bs${url}`, { ...bet, amount: oneClickBettingStake });

            if (response?.status !== 200) {
                dispatchError(
                    response?.data?.message ?? langData?.["bet_placed_txt"],
                );
                return false;
            }

            return response.data;
        } catch (e) {
            dispatchError(
                e.response?.data?.message ?? langData?.["general_err_txt"],
            );
            return false;
        }
    },
);

export const fetchButtonVariables = createAsyncThunk(
    "exchBetSlip/fetchButtonVariables",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth("/getStackButtonAPI", {});
            if(response?.data?.success && Array.isArray(response?.data?.data?.priceArray)) {
                let requiredArr = [];
                response?.data?.data?.priceArray.forEach((item, index) => {
                    requiredArr.push({ 
                        label: item?.[`label${index+1}`],
                        stake: Number(item?.[`price${index+1}`])
                    });
                });
                return requiredArr;
            } else {
                const errorMessage = response?.data?.message || "Failed to fetch Stakes";
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message ||
                error.message ||
                "Failed to fetch Stakes";
            return rejectWithValue(errorMessage);
        }
    },
);

export const fetchOpenBets = createAsyncThunk(
    "exchBetSlip/fetchOpenBets",
    /**
     * @param {{ eventId: string | number, eventTypeId: string | number }} arg
     */
    async ({ eventId, eventTypeId }, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth("/getBetsAPI", { deleted: false, result: 'ACTIVE' });

            if(response?.data?.success && Array.isArray(response?.data?.data)) {
                const requiredOpenBets = response?.data?.data?.filter(item => item?.eventId == eventId && item?.eventTypeId == eventTypeId) ?? [];
                return requiredOpenBets;
            } else {
                const errorMessage = response?.data?.message || "Failed to fetch open bets";
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch open bets";
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
                    state.bets[index].amount =
                        (state.bets[index].amount || 0) + amount;
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
                (bet) => bet.marketId !== action.payload,
            );
        },

        clearSuccessBets: (state, action) => {
            if (action.payload?.length) {
                state.bets = state.bets.filter(
                    (_, index) => !action.payload.includes(index),
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
                (bet) => bet.betId !== action.payload,
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
                if (
                    bet.marketId === marketId &&
                    bet.marketType === marketType
                ) {
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
    },
    extraReducers: (builder) => {
        builder

        // oneClickBetPlaceHandler
        .addCase(oneClickBetPlaceHandler.pending, (state) => {
            state.oneClickBettingLoading = true;
        })
        .addCase(oneClickBetPlaceHandler.fulfilled, (state) => {
            state.oneClickBettingLoading = false;
        })
        .addCase(oneClickBetPlaceHandler.rejected, (state) => {
            state.oneClickBettingLoading = false;
        })

        //fetchOpenBets
        .addCase(fetchOpenBets.fulfilled, (state, action) => {
            state.openBets = action.payload;
        })

        //fetchButtonVariables
        .addCase(fetchButtonVariables.fulfilled, (state, action) => {
            state.buttonVariables = action.payload;
        })
    },

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
