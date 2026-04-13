import axios from "axios";
import { CryptoInstance } from "../util/crypto";
import { logout } from "../store/slices/authSlice";
import { storageManager } from "../util/storageManager";
const BASE_URL = import.meta.env.VITE_BASE_URL;


let storeRef = null;
export const setStoreReference = (store) => {
  storeRef = store;
};


export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const apiAUTH = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


/* ============================================================
   AUTH REQUEST INTERCEPTOR (add bearer token)
   ============================================================ */
apiAUTH.interceptors.request.use(
  (config) => {
    const token = storageManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


/* ============================================================
   SHARED ENCRYPTION LOGIC FOR BOTH api AND apiAUTH
   ============================================================ */
const encryptRequest = async (config) => {
  if (config.skipEncryption === true || config.method === "get") {
    return config;
  }

  const body = config.data || {};
  const encrypted = await CryptoInstance.encryptWithAESGCM(body);
  config.data = encrypted; // { data, iv }
  config.headers["Content-Type"] = "application/json; charset=utf-8";

  return config;
};

const decryptResponse = async (response) => {
    if (response.config.skipDecryption === true) {
      return response;
    }

    const enc = response.data;

    if (enc && enc.data && enc.iv) {
      const decrypted = await CryptoInstance.decryptWithAESGCM(enc);
      response.data = decrypted;
    }

    return response;
};

const decryptError = async (error) => {
  const enc = error?.response?.data;

  if (enc && enc.data && enc.iv) {
    try {
      const decrypted = await CryptoInstance.decryptWithAESGCM(enc);
      error.response.data = decrypted;
    } catch (e) {
      console.warn("Error while decrypting error response");
    }
  }
  return error;
};

const handleAuthError = async (error) => {
  const status = error?.response?.status;

  if (status == 401 || status == 403 ) {
    if (storeRef) {
      storeRef.dispatch(logout());
    }
  }
  
  return Promise.reject(error);
};

// Public API
api.interceptors.request.use(encryptRequest, (e) => Promise.reject(e));
api.interceptors.response.use(decryptResponse, decryptError);

// Auth API
apiAUTH.interceptors.request.use(encryptRequest, (e) => Promise.reject(e));
apiAUTH.interceptors.response.use(decryptResponse, async (error) => {
  const decryptedError = await decryptError(error);
  return handleAuthError(decryptedError);
});

