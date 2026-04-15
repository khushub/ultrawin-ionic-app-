import { createSlice, createAsyncThunk  } from "@reduxjs/toolkit";
import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermissions";

export const isSiteUnderMaintenance = createAsyncThunk(
  "common/isSiteUnderMaintenance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await CATALOG_API.get(`/catalog/site-under-maintenance`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
    allowedConfig: CONFIG_PERMISSIONS.sports + CONFIG_PERMISSIONS.casino,
    commissionEnabled: false,
    domainConfig: {
        demoUser: false,
        signup: false,
        whatsapp: false,
        payments: false,
        bonus: false,
        affiliate: false,
        depositWagering: false,
        suppportContacts: null,
        apkUrl: null,
        b2cEnabled: false,
        ruleScope: 'HOUSE',
    },
    alert: {
        type: '',
        message: '',
    },
    languages: [],
    langSelected: null,
    langData: null,
    maintenanceTimer: '',
    trendingGames: [],
    demoUserWhatsappDetails: null,
};


const commonSlice = createSlice({
    name: 'common',
    initialState,
    reducers: {
        setAllowedConfig: (state, action) => {
            state.allowedConfig = action.payload;
        },
        enableCommission: (state, action) => {
            state.commissionEnabled = action.payload;
        },
        setDomainConfig: (state, action) => {
            state.domainConfig = action.payload;
        },
        setAlertMsg: (state, action) => {
            state.alert.type = action.payload.type || '';
            state.alert.message = action.payload.message || '';
        },
        setLanguages: (state, action) => {
            state.languages = action.payload
        },
        setLangSelected: (state, action) => {
            state.langSelected = action.payload
        },
        setLangData: (state, action) => {
            state.langData = action.payload
        },
        setMaintenanceTimer: (state, action)=>{
            state.maintenanceTimer = action.payload
        },
        setTrendingGames: (state, action) => {
    state.trendingGames = action.payload;
},
setDemoUserWhatsappDetails: (state, action) => {
    state.demoUserWhatsappDetails = action.payload;
},

    }
});


export const {
    setAllowedConfig,
    enableCommission,
    setDomainConfig,
    setAlertMsg,
    setLanguages,
    setLangSelected,
    setLangData,
    setMaintenanceTimer,
     setTrendingGames ,
     setDemoUserWhatsappDetails
} = commonSlice.actions;
export default commonSlice.reducer;