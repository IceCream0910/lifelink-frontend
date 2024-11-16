export default async function getPatient(id?: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/patient/${id ? id : ''}`, {
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