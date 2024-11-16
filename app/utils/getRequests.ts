export default async function getHospital(id?: string, type?: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/request/${id ? id : ''}?type=${type}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get requests');
    } else {
        return response.json();
    }
}