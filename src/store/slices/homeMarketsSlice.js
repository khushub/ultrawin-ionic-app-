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


export const fetchEventsBySport = createAsyncThunk(
    "homeMarkets/fetchEventsBySport",
    async (
        /** @type {{ eventTypeId: string }} */
        {eventTypeId}, 
        { getState, rejectWithValue }
    ) => {

        if(!eventTypeId) {
            return rejectWithValue("SportId not defined!");
        }

        const state = getState();
        const apiInstance = state.auth?.loggedIn? postAPIAuth : postAPI;
        const endpoint = state.auth?.loggedIn ? '/getHomeMarketsAPI' : '/getFreeHomeMarketsAPI';
    
        try {
            const response = await apiInstance(endpoint, { eventTypeId: [eventTypeId] });
            
            if (response?.data?.success && Array.isArray(response?.data?.data)) {
                const processedEvents = response.data.data.map((event) => {
                    const safeCompId = event.competitionId?.split(':').join('_');
                    const safeEventId = event.eventId?.split(':').join('_');

                    return {
                        ...event,
                        sportId: event.eventTypeId,
                        competitionId: safeCompId,
                        eventId: safeEventId,
                        status: event?.marketBook?.inplay ? 'IN_PLAY' : 'UPCOMING',
                    };
                });
                return processedEvents;
            } else {
                return rejectWithValue("No events found");
            }

        } catch (error) {
            const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch events";
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

        if(!eventTypeId || !competitionId) {
            return rejectWithValue("SportId or CompetitionId not defined!");
        }

        const state = getState();
        const apiInstance = state.auth?.loggedIn? postAPIAuth : postAPI;
        const endpoint = state.auth?.loggedIn ? '/getHomeMarketsAPI' : '/getFreeHomeMarketsAPI';

        try {
            const response = await apiInstance(endpoint, { eventTypeId: [eventTypeId] });

            if (response?.data?.success && Array.isArray(response?.data?.data)) {
                const requiredData = response.data.data.filter(item => item?.competitionId == competitionId);
                const processedEvents = requiredData.map((event) => {
                    const safeCompId = event.competitionId?.split(':').join('_');
                    const safeEventId = event.eventId?.split(':').join('_');

                    return {
                        ...event,
                        sportId: event.eventTypeId,
                        competitionId: safeCompId,
                        eventId: safeEventId,
                        status: event?.marketBook?.inplay ? 'IN_PLAY' : 'UPCOMING',
                    };
                });
                return processedEvents;
            } else {
                return rejectWithValue("No events found");
            }
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
        const apiInstance = state.auth?.loggedIn? postAPIAuth : postAPI;
        const endpoint = state.auth?.loggedIn ? '/getHomeMarketsAPI' : '/getFreeHomeMarketsAPI';


        try {
            const response = await apiInstance(endpoint, {});

            if (response?.data?.success && Array.isArray(response?.data?.data)) {
                const requiredData = response.data.data.filter(item => !!item?.marketBook?.inplay);

                const processedEvents = requiredData.map((event) => {
                    const safeCompId = event.competitionId?.split(':').join('_');
                    const safeEventId = event.eventId?.split(':').join('_');

                    return {
                        ...event,
                        sportId: event.eventTypeId,
                        competitionId: safeCompId,
                        eventId: safeEventId,
                        status: event?.marketBook?.inplay ? 'IN_PLAY' : 'UPCOMING',
                    };
                });
                return processedEvents;
            } else {
                return rejectWithValue("No events found");
            }
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
            // fetchCompetitions
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

            // fetchEventsBySport
            .addCase(fetchEventsBySport.pending, (state) => {
                state.fetchingEvents = true;
            })
            .addCase(fetchEventsBySport.fulfilled, (state, action) => {
                state.fetchingEvents = false;
                const eventsList = action.payload;

                eventsList.forEach(eData => {
                    const eId = eData.sportId;
                    const cId = eData.competitionId;
                    const eventId = eData.eventId;

                    if (!state.events[eId]) {
                        state.events[eId] = {};
                    }
                    if (!state.events[eId][cId]) {
                        state.events[eId][cId] = {};
                    }
                    state.events[eId][cId][eventId] = eData;
                });
            })
            .addCase(fetchEventsBySport.rejected, (state, action) => {
                state.fetchingEvents = false;
            })

            // fetchEventsByCompetition
            .addCase(fetchEventsByCompetition.pending, (state) => {
                state.fetchingEvents = true;
            })
            .addCase(fetchEventsByCompetition.fulfilled, (state, action) => {
                state.fetchingEvents = false;
                const eventsList = action.payload;

                eventsList.forEach(eData => {
                    const eId = eData.sportId;
                    const cId = eData.competitionId;
                    const eventId = eData.eventId;

                    if (!state.events[eId]) {
                        state.events[eId] = {};
                    }
                    if (!state.events[eId][cId]) {
                        state.events[eId][cId] = {};
                    }
                    state.events[eId][cId][eventId] = eData;
                });
            })
            .addCase(fetchEventsByCompetition.rejected, (state, action) => {
                state.fetchingEvents = false;
            })

            // fetchEventsByCompetition
            .addCase(fetchInplayEvents.pending, (state) => {
                state.fetchingEvents = true;
            })
            .addCase(fetchInplayEvents.fulfilled, (state, action) => {
                state.fetchingEvents = false;
                const eventsList = action.payload;

                eventsList.forEach(eData => {
                    const eId = eData.sportId;
                    const cId = eData.competitionId;
                    const eventId = eData.eventId;

                    if (!state.events[eId]) {
                        state.events[eId] = {};
                    }
                    if (!state.events[eId][cId]) {
                        state.events[eId][cId] = {};
                    }
                    state.events[eId][cId][eventId] = eData;
                });
            })
            .addCase(fetchInplayEvents.rejected, (state, action) => {
                state.fetchingEvents = false;
            });
    }
});

export const { 
    setEventType, 
    setCompetition, 
    clearAllEvents,
    setExchEvent 
} = homeMarketsSlice.actions;
export default homeMarketsSlice.reducer;