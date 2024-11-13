export default async function getHospital(id?: string, type?: string) {
    const response = await fetch(`http://localhost:4000/request/${id ? id : ''}?type=${type}`, {
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