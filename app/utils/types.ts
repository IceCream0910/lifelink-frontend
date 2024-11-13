export type Hospital = {
    id: number;
    name: string;
    patients: any[];
    requests: any[];
    location: string;
};

export type Request = {
    id: number
    hospital_id: number
    patient_id: number
    patient_data: JSON
    hospital_data: JSON
    status: string
    distance: number
}