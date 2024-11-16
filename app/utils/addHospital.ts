import { Hospital } from './types';

export default async function getHospital(data: Hospital) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hospital`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to add patient');
    } else {
        return response.json();
    }
}