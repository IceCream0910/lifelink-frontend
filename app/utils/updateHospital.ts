import { Hospital } from './types';

export default async function updateHospital(data: Hospital) {
    const response = await fetch(`http://localhost:4000/hospital/${data.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to update patient');
    } else {
        return response.json();
    }
}