import { createSlice } from '@reduxjs/toolkit';



export const eventSlice = createSlice({
    name: 'event',
    initialState: {
        eventLoaded: false,
        eventData: null,
        premiumData: null,
        marketData: null,
        isInplay: false,
        eventName: null,
        competitionName: null,
        openDate: undefined,
        video: null,         //iframe
        score: null,         //iframe
        cricketScore: null,
        ladderMarketId: '',
        totalPremiumCount: 0
    },
    reducers: {
        getEventDataSuccess: (state, action) => { 
            state.eventData = action.payload;
        },
        getPremiumData: (state, action) => { 
            state.premiumData = action.payload;
            state.totalPremiumCount = action.payload?.length ?? 0;
        },
        getMarketData: (state, action) => ({ ...state, marketData: action.payload }),
        setEventLoaded: (state, action) => ({ ...state, eventLoaded: action.payload }),
        setIsInplay: (state, action) => ({ ...state, isInplay: action.payload }),
        setEventName: (state, action) => ({ ...state, eventName: action.payload }),
        setCompetitionName: (state, action) => ({ ...state, competitionName: action.payload }),
        setEventOpenDate: (state, action) => ({ ...state, openDate: action.payload }),
        getEventVideo: (state, action) => ({ ...state, video: action.payload }),
        getEventScore: (state, action) => ({ ...state, score: action.payload }),
        getCricketScore: (state, action) => ({ ...state, cricketScore: action.payload }),
        setLadderMarketId: (state, action) => ({ ...state, ladderMarketId: action.payload }),
        clearEventData: (state) => {
            state.eventLoaded = false;
            state.eventData = null;
            state.premiumData = null;
            state.marketData = null;
            state.isInplay = false;
            state.eventName = null;
            state.competitionName = null;
            state.openDate = undefined;
            state.video = null;
            state.score = null;
            state.cricketScore = null;
            state.totalPremiumCount = 0;
        }
    },
})

export const {
    getEventDataSuccess,
    getPremiumData,
    setEventLoaded,
    getMarketData,
    setIsInplay,
    setEventName,
    setCompetitionName,
    setEventOpenDate,
    getEventVideo,
    getEventScore,
    getCricketScore,
    setLadderMarketId,
    clearEventData,
} = eventSlice.actions

export default eventSlice.reducer
