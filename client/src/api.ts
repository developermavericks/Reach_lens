import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const analyzeUrl = async (url: string, version: string = 'v5') => {
    const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, version }),
    });
    return await response.json();
};
