import { api, apiAUTH } from "./axiosInstance";

// PUBLIC APIs
export const getAPI = async (url, params) => {
  const response = await api.get(url, { params });
  return response;
};
export const postAPI = async (url, params, config = {}) => {
  const response = await api.post(url, params,
    {
      ...config,
      headers: {
        ...config.headers,
      },
    }
  );
  return response;
};




// PROTECTED APIs
export const getAPIAuth = async (url, params) => {
  const response = await apiAUTH.get(url, { params });
  return response;
};

export const postAPIAuth = async (url, params) => {
  const response = await apiAUTH.post(url, params);
  return response;
};

export const putAPIAuth = async (url, params) => {
  const response = await apiAUTH.put(url, params);
  return response;
};

export const formDataAuth = async (url, params) => {
  const response = await apiAUTH.post(url, params, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
};
