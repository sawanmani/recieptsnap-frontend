// lib/api.ts
import { getSession } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const api = {
  /**
   * Makes a GET request to the backend API
   * @param url - The API endpoint to call
   * @param token - Optional authentication token
   * @returns The fetch Response object
   */
  async get(url: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'GET',
      headers,
    });
    
    return response;
  },

  /**
   * Makes a POST request to the backend API
   * @param url - The API endpoint to call
   * @param data - Optional request body data
   * @param token - Optional authentication token
   * @returns The fetch Response object
   */
  async post(url: string, data?: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return response;
  },

  /**
   * Makes a PUT request to the backend API
   * @param url - The API endpoint to call
   * @param data - Request body data
   * @param token - Optional authentication token
   * @returns The fetch Response object
   */
  async put(url: string, data: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    return response;
  },

  /**
   * Makes a DELETE request to the backend API
   * @param url - The API endpoint to call
   * @param token - Optional authentication token
   * @returns The fetch Response object
   */
  async delete(url: string, token?: string) {
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: 'DELETE',
      headers,
    });

    return response;
  },
};