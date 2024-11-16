import { preKtas } from "../paramedic/manual/context";

export default async function addPatient(data: preKtas) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/patient`, {
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