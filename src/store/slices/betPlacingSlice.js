import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    marketId: null,
    marketType: null,
    marketName: null,
    completeMarket: null,
    runnerId: null,
    runnerName: null,
    isBack: null,
    price: null,
    prevPrice: null,
    size: null,
    stake: null,
    confirmation: false,
    eventTypeId: null,
    eventId: null,
    eventName: null,
    isSubmitting: false,
    isCashOut: false,
    minMaxAll: null,
    limitStatus: false,           //if false, then limit from event pulse / else from marketById
    betPlacingPopoverStage2: false,
    betDelay: {
      matchoddsBetDelay: 0,
      soccerBetDelay: 0,
      tennisBetDelay: 0,
      bookmakerBetDelay: 0,
      fancyBetDelay: 0,
      ballbyballBetDelay: 0,
      virtualBetDelay: 0,
    },
}

const betPlacingSlice = createSlice ({
    name: 'betPlacing',
    initialState,
    reducers: {
        setBetPlacingData: (state, action) => {
            state.marketId = action.payload.marketId || null;
            state.marketType = action.payload.marketType || null;
            state.marketName = action.payload.marketName || null;
            state.completeMarket = action.payload.completeMarket || null;
            state.runnerId = action.payload.runnerId || null;
            state.runnerName = action.payload.runnerName || null;
            state.isBack = action.payload.isBack || null;
            state.eventTypeId = action.payload.eventTypeId || null;
            state.eventId = action.payload.eventId || null;
            state.eventName = action.payload.eventName || null;
            state.price = action.payload.price || null;
            state.prevPrice = action.payload.prevPrice || null;
            state.size = action.payload.size || null;
            state.isCashOut = action.payload.isCashOut || null;
            state.isSubmitting = false;
            state.betPlacingPopoverStage2 = false;
        },
        clearBetPlacingData: (state) => {
            state.marketId = null;
            state.marketType = null;
            state.marketName = null;
            state.completeMarket = null;
            state.runnerId = null;
            state.runnerName = null;
            state.isBack = null;
            state.price = null;
            state.prevPrice = null;
            state.size = null;
            state.stake = null;
            state.eventTypeId = null;
            state.eventId = null;
            state.eventName = null;
            state.isCashOut = false;
            state.isSubmitting = false;
            state.betPlacingPopoverStage2 = false;
        },

        setMarketId: (state, action) => ({ ...state, marketId: action.payload }),
        setMarketType: (state, action) => ({ ...state, marketType: action.payload }),
        setMarketName: (state, action) => ({ ...state, marketName: action.payload }),
        setIsCashOut: (state, action) => ({ ...state, isCashOut: action.payload }),
        setCompleteMarket: (state, action) => ({ ...state, completeMarket: action.payload }),
        setRunnerId: (state, action) => ({ ...state, runnerId: action.payload }),
        setRunnerName: (state, action) => ({ ...state, runnerName: action.payload }),
        setIsBack: (state, action) => ({ ...state, isBack: action.payload }),
        setPrice: (state, action) => ({ ...state, price: action.payload }),
        setPrevPrice: (state, action) => ({ ...state, prevPrice: action.payload }),
        setSize: (state, action) => ({ ...state, size: action.payload }),
        setStake: (state, action) => ({ ...state, stake: action.payload }),
        setConfirmation: (state, action) => ({ ...state, confirmation: action.payload }),
        setEventTypeId: (state, action) => ({ ...state, eventTypeId: action.payload }),
        setEventId: (state, action) => ({ ...state, eventId: action.payload }),
        setEventName: (state, action) => ({ ...state, eventName: action.payload }),
        setBetPlacingPopoverStage: (state, action) => ({ ...state, betPlacingPopoverStage2: action.payload }),
        setMinMaxAll: (state, action) => ({ ...state, minMaxAll: action.payload }),
        setLimitStatus: (state, action) => ({ ...state, limitStatus: action.payload }),
        setStartTime: (state, action) => ({ ...state, startTime: action.payload }),
        setIsSubmitting: (state, action) => ({ ...state, isSubmitting: action.payload }),
        setBetDelay: (state, action) => ({ ...state, betDelay: action.payload }),
    }
})

export const {
    setBetPlacingData,
    clearBetPlacingData,
    setMarketId,
    setMarketType,
    setMarketName,
    setIsCashOut,
    setCompleteMarket,
    setRunnerId,
    setRunnerName,
    setIsBack,
    setPrice,
    setPrevPrice,
    setSize,
    setStake,
    setConfirmation,
    setEventTypeId,
    setEventId,
    setEventName,
    setBetPlacingPopoverStage,
    setMinMaxAll,
    setLimitStatus,
    setStartTime,
    setIsSubmitting,
    setBetDelay
} = betPlacingSlice.actions;
export default betPlacingSlice.reducer;