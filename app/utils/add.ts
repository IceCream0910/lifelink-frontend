import { preKtas } from "../context";

export default async function addPatient(data: preKtas) {
    const response = await fetch('http://localhost:4000/patient', {
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