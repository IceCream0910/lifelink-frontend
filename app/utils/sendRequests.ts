import { preKtas } from "../paramedic/manual/context";

export default async function sendRequests(data: preKtas) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/patient/sendRequests/${data.id}`, {
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