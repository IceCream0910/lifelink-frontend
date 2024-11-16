import { Request } from './types';

export default async function updateRequest(data: Request) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/request/${data.id}`, {
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