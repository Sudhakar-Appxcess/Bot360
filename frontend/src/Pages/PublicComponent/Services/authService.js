import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_API_URL_AUTH}`;

export const login = async (username, password, role) => {
  const url = `${API_BASE_URL}/login/${role}`;
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  
  try {
    const response = await axios.post(url, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      withCredentials: true,
    });

    if (!response.data) {
      throw new Error('Login failed: No response data');
    }

    localStorage.setItem('role', response.data.role);
    
    return response.data; 
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.response?.data?.detail || 'Login failed: Unknown error');
  }
};

export const register = async (username, password, email, role) => {
  const url = `${API_BASE_URL}/register/${role}`;
  try {
    const response = await axios.post(url, { username, password, email });

    if (!response.data) {
      throw new Error('Registration failed: No response data');
    }

    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(error.response?.data?.message || 'Registration failed: Unknown error');
  }
};
