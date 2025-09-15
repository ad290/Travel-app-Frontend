import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://travel-app-backend-u2tw.vercel.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Destination API calls
export const destinationService = {
  getAllDestinations: async () => {
    const response = await apiClient.get('/destinations');
    return response.data;
  },

  getDestinationById: async (id) => {
    const response = await apiClient.get(`/destinations/${id}`);
    return response.data;
  },

  createDestination: async (destinationData) => {
    const response = await apiClient.post('/destinations', destinationData);
    return response.data;
  },

  updateDestination: async (id, destinationData) => {
    const response = await apiClient.put(`/destinations/${id}`, destinationData);
    return response.data;
  },

  deleteDestination: async (id) => {
    const response = await apiClient.delete(`/destinations/${id}`);
    return response.data;
  }
};

// Hotel API calls
export const hotelService = {
  getAllHotels: async (destinationId = null) => {
    const url = destinationId ? `/hotels?destinationId=${destinationId}` : '/hotels';
    const response = await apiClient.get(url);
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data;
  },

  getHotelsByDestination: async (destinationId) => {
    const response = await apiClient.get(`/hotels/destination/${destinationId}`);
    return response.data;
  },

  createHotel: async (hotelData) => {
    const response = await apiClient.post('/hotels', hotelData);
    return response.data;
  },

  updateHotel: async (id, hotelData) => {
    const response = await apiClient.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  deleteHotel: async (id) => {
    const response = await apiClient.delete(`/hotels/${id}`);
    return response.data;
  }
};

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
