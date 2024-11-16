export default async function deleteRequest(id?: string, type?: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/request/${id ? id : ''}?type=${type}`, {
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