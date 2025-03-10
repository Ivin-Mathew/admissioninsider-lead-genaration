import axios, { AxiosResponse } from 'axios';
import { User, CreateUserDTO, UpdateUserStatusDTO, UserFilters, PaginatedResponse } from '@/types/user';

const BASE_URL = 'https://backend.lejit.ai/backend/api/adminModule';
const HARDCODED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YTYxMGQ5MjI5NWYwNTc2NGYzOTJjMiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczOTM2MjU4MH0.IVyaQPw7FKEuL_PMO6XcPWkYLLPhp6Gmn_61OntAt_Q';

interface APIConfig {
  token: string;
}

export const getUsers = async ({
    page,
    filters,
  }: {
    page: number;
    filters: UserFilters;
  }): Promise<PaginatedResponse<User>> => {
    try {
      // Make the API call
      const response: AxiosResponse<any> = await axios.get(`${BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${HARDCODED_TOKEN}`,
          'Content-Type': 'application/json',
        },
        params: {
          page,
          ...filters,
        },
      });
  
      // Extract the relevant data from the response
      const { data } = response;
      
  
      // Transform the response into the PaginatedResponse format
      const paginatedResponse: PaginatedResponse<User> = {
        users: data?.users || [], // Ensure users is an array
        totalPages: data?.totalPages || 0, // Ensure totalPages is a number
        currentPage: data?.currentPage || page, // Ensure currentPage is a number
      };
  
      return paginatedResponse;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // Re-throw the error for handling elsewhere
    }
  };

export const createUser = async (
  { userData }: { userData: CreateUserDTO }
): Promise<AxiosResponse<User>> => {
  return axios.post(`${BASE_URL}/users`, userData, {
    headers: {
      Authorization: `Bearer ${HARDCODED_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};

export const updateUserStatus = async (
  { userId, statusData }: { userId: string; statusData: UpdateUserStatusDTO }
): Promise<AxiosResponse<User>> => {
  return axios.patch(`${BASE_URL}/users/${userId}`, statusData, {
    headers: {
      Authorization: `Bearer ${HARDCODED_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};

export const deleteUser = async (
  { userId }: { userId: string }
): Promise<AxiosResponse<void>> => {
  return axios.delete(`${BASE_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${HARDCODED_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};