export default async function getHospital(id?: string) {
    const response = await fetch(`http://localhost:4000/hospital/${id ? id : ''}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get hospital');
    } else {
        return response.json();
    }
}