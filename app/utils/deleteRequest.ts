export default async function deleteRequest(id?: string, type?: string) {
    const response = await fetch(`http://localhost:4000/request/${id ? id : ''}?type=${type}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete requests');
    } else {
        return true;
    }
}