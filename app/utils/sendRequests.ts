import { preKtas } from "../context";

export default async function sendRequests(data: preKtas) {
    const response = await fetch('http://localhost:4000/patient/sendRequests/' + data.id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to add patient');
    } else {
        return response.json();
    }
}