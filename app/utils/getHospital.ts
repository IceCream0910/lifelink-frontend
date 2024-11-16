export default async function getHospital(id?: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hospital/${id ? id : ''}`, {
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