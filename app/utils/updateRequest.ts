import { Request } from './types';

export default async function updateRequest(data: Request) {
    const response = await fetch(`http://localhost:4000/request/${data.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to update request');
    } else {
        return true;
    }
}