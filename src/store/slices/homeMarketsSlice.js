import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EXCHANGE_EVENT_TYPES } from "../../constants/ExchangeEventTypes";
import { postAPI, postAPIAuth } from "../../services/apiInstance";
import { SPToBFIdMap } from "../../util/stringUtil";


export const fetchCompetitions = createAsyncThunk(
    "homeMarkets/fetchCompetitions",
    /**
     * @param {string} eventTypeId
     * @param {object} thunkAPI
     */
    async (eventTypeId, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getHomeAllCompititionAPI', { eventTypeId });

            if (response?.data?.success) {
                return response.data.response || [];
            } else {
                const errorMessage = response?.data?.message || "Failed to fetch competitions";
                return rejectWithValue(errorMessage);
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch competitions";
            return rejectWithValue(errorMessage);
        }
    },
);


export const fetchEventsByCompetition = createAsyncThunk(
    "homeMarkets/fetchEventsByCompetition",
    async (
        /** @type {{ eventTypeId: string, competitionId: string, events: any[], track: string | undefined }} */
        { eventTypeId, competitionId, events, track }, 
        { getState, rejectWithValue }
    ) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getHomeAllEventsAPI', { eventTypeId, competitionId });
            console.log('fetchEventsByCompetition response: ', response);

            // if (response?.data?.success) {
            //     return response.data.response || [];
            // } else {
            //     const errorMessage = response?.data?.message || "Failed to fetch events";
            //     return rejectWithValue(errorMessage);
            // }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch events";
            return rejectWithValue(errorMessage);
        }
    },
);


export const fetchInplayEvents = createAsyncThunk(
    "homeMarkets/fetchInplayEvents",
    async (_, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getInplyEventsAPI', {});
            console.log('fetchInplayEvents response: ', response);

            // if (response?.data?.success) {
            //     return response.data.response || [];
            // } else {
            //     const errorMessage = response?.data?.message || "Failed to fetch inplay events";
            //     return rejectWithValue(errorMessage);
            // }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch inplay events";
            return rejectWithValue(errorMessage);
        }
    },
);


export const fetchEventsInDateRange = createAsyncThunk(
    "homeMarkets/fetchEventsInDateRange",
    async (startDate, endDate, { getState, rejectWithValue }) => {
        const state = getState();
        if (!state.auth?.loggedIn) {
            return rejectWithValue("User is not logged in. Aborting request.");
        }

        try {
            const response = await postAPIAuth('/getInplyEventsAPI', {});
            console.log('fetchInplayEvents response: ', response);

            // if (response?.data?.success) {
            //     return response.data.response || [];
            // } else {
            //     const errorMessage = response?.data?.message || "Failed to fetch inplay events";
            //     return rejectWithValue(errorMessage);
            // }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch inplay events";
            return rejectWithValue(errorMessage);
        }
    },
);


export const fetchEventsBySport = createAsyncThunk(
    "homeMarkets/fetchEventsBySport",
    async (
        /** @type {{ eventTypeId: string, events: any[] }} */
        {eventTypeId, events}, 
        { getState, rejectWithValue }
    ) => {
        const state = getState();
        const apiInstance = state.auth?.loggedIn? postAPIAuth : postAPI;
        const endpoint = state.auth?.loggedIn ? '/getHomeMarketsAPI' : '/getFreeHomeMarketsAPI';
        

        try {
            const response = await apiInstance(endpoint, { eventTypeId: [eventTypeId] });
            console.log('fetching events by sport response: ', response);

                //     let newList = [];
                //     let eventsList = [];


                //     if (result && response?.data?.data?.length > 0) {
                //         for (let eventData of response?.data?.data) {
                //             try {
                //                 if (eventData?.eventId) {
                //                     newList.push(eventData?.eventId);
                                    
                //                     const eData = {
                //                         // enabled: eventData?.enabled,
                //                         status: eventData?.marketBook?.status,
                //                         openDate: eventData?.openDate,
                //                         // customOpenDate: eventData?.customOpenDate,
                //                         sportId: eventData?.eventTypeId.includes(':')
                //                             ? SPToBFIdMap[eventData?.eventTypeId]
                //                             : eventData?.eventTypeId,
                //                         competitionId: eventData?.competitionId,
                //                         competitionName: eventData?.competitionName
                //                             ? eventData?.competitionName
                //                             : 'Other',
                //                         eventId: eventData?.eventId,
                //                         eventName: eventData?.eventName,
                //                         // customEventName: eventData?.customEventName,
                //                         marketId: eventData?.marketBook?.marketId,
                //                         // providerName: eventData?.providerName,
                //                         enableFancy: !!eventData?.fancy || false,
                //                         enableMatchOdds: eventData?.marketType === 'MATCH_ODDS' ||  false,
                //                         enableBookmaker: !!eventData?.bm || false,
                //                         // bookMakerProvider: eventData?.markets
                //                         //     ? eventData?.markets?.bookMakerProvider
                //                         //     : '',
                //                         // fancyProvider: eventData?.markets
                //                         //     ? eventData?.markets?.fancyProvider
                //                         //     : '',
                //                         enablePremium: eventData?.markets
                //                             ? eventData?.markets?.enablePremium
                //                             : false,
                //                         enableToss: eventData?.markets
                //                             ? eventData?.markets?.enableToss
                //                             : false,
                //                         // catId: eventData?.catId,
                //                         // virtualEvent: eventData?.virtualEvent,
                //                         // macPremiumEnabled: eventData?.macPremiumEnabled,
                //                     };

                //                     eventsList.push({
                //                         ...eData,
                //                         sportId: eData.eventTypeId,
                //                         competitionId: eData.competitionId,
                //                         matchOddsData:
                //                             eventData?.markets && eventData?.markets?.matchOdds
                //                             ? eventData?.markets?.matchOdds?.find(
                //                                 (mo) =>
                //                                     mo.marketName === 'Match Odds' ||
                //                                     mo?.marketName?.toLowerCase() === 'moneyline' ||
                //                                     eventData?.providerName?.toLowerCase() ===
                //                                     'sportradar'
                //                                 )
                //                             : null,
                //                         raceMarkets:
                //                             eventData.markets && eventData.markets.matchOdds
                //                             ? eventData.markets.matchOdds
                //                             : [],
                //                     });

                //                     // if (eData.sportId === '1') {
                //                     //     if (eventData?.markets?.matchOdds?.length > 0) {
                //                     //         for (let mo of eventData.markets.matchOdds) {
                //                     //             if (
                //                     //                 mo.marketName !== 'Match Odds' &&
                //                     //                 mo.marketName.toLowerCase() !== 'moneyline'
                //                     //             ) {
                //                     //                 const secMOPayload = {
                //                     //                     eventId: eData.eventId,
                //                     //                     marketId: mo.marketId,
                //                     //                     matchOddsData: mo,
                //                     //                 };
                //                     //                 dispatch(updateSecondaryMatchOdds(secMOPayload));
                //                     //             }
                //                     //         }
                //                     //     }
                //                     // }
                //                 }
                //             } catch (err) {
                //             console.log(err);
                //             }
                //         }

                //         // Dispatch a single action with all events
                //         dispatch(fetchEventByCompetitionSuccess({ events: eventsList }));

                //         if (events && events.length > 0) {
                //             for (let ie of events) {
                //                 //todo : revisit this piece of code
                //                 if (!newList.includes(ie.eventId.split('_').join(':'))) {
                //                     const payload = {
                //                         sportId: ie.sportId,
                //                         competitionId: ie.competitionId,
                //                         eventId: ie.eventId,
                //                         disableEvent: false,
                //                     };
                //                     dispatch(disableEventData(payload));
                //                 }
                //             }
                //         }
                // } else {
                //     if (events) {
                //         for (let ie of events) {
                //             const payload = {
                //                 sportId: ie.sportId,
                //                 competitionId: ie.competitionId,
                //                 eventId: ie.eventId,
                //                 disableEvent: false,
                //             };
                //             dispatch(disableEventData(payload));
                //         }
                //     }
                // }
                // dispatch(setLoading(false));




            // if (response?.data?.success) {
            //     return response.data.response || [];
            // } else {
            //     const errorMessage = response?.data?.message || "Failed to fetch events";
            //     return rejectWithValue(errorMessage);
            // }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch events";
            return rejectWithValue(errorMessage);
        }
    },
);




const initailState = {
    eventTypes: EXCHANGE_EVENT_TYPES,
    selectedEventType: { id: '', name: '', slug: '' },
    fetchingEvents: false,
    pageNumebr: 1,
    pageSize: 20,
    competitions: {},
    selectedCompetition: { id: '', name: '', slug: '' },
    events: {},
    selectedEvent: { id: '', name: '', slug: '' },
}

const homeMarketsSlice = createSlice({
    name: 'homeMarkets',
    initialState: initailState,
    reducers: {
        setEventType: (state, action) => {
            state.selectedEventType = action.payload;
            state.pageNumebr = 1;
        },
        setCompetition: (state, action) => {
            state.selectedCompetition = action.payload;
            state.pageNumebr = 1;
        },
        clearAllEvents: (state) => {
            state.events = {};
        },
        setExchEvent: (state, action) => {
            state.selectedEvent = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompetitions.fulfilled, (state, action) => {             
                const eventTypeId = action.meta.arg;
                const rawCompetitions = action.payload;

                const processedCompetitions = rawCompetitions.map(c => {
                    const nameSlug = c.name
                        .toLocaleLowerCase()
                        .replace(/[^a-z0-9]/g, ' ')
                        .replace(/ +/g, ' ')
                        .trim()
                        .split(' ')
                        .join('-');

                    return {
                        id: c.id,
                        name: c.name,
                        slug: nameSlug,
                        sportId: eventTypeId,
                    };
                });

                state.competitions[eventTypeId] = processedCompetitions;
            })
    }
});

export const { 
    setEventType, 
    setCompetition, 
    clearAllEvents,
    setExchEvent 
} = homeMarketsSlice.actions;
export default homeMarketsSlice.reducer;