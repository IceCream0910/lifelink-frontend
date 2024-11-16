export default async function deletePatient(id?: string) {
    const response = await fetch(`http://localhost:4000/patient/${id ? id : ''}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete patient');
    } else {
        return true;
    }
}