export default async function getPatient(id?: string) {
    const response = await fetch(`http://localhost:4000/patient/${id ? id : ''}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get patient');
    } else {
        return response.json();
    }
}