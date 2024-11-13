"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import getHospital from '../../../utils/getHospital';
import getRequests from '../../../utils/getRequests';
import Spacer from '../../../components/spacer';
import updateHospital from '../../../utils/updateHospital';
import updateRequest from '../../../utils/updateRequest';
import { supabase } from '../../../utils/supabase';

export default function Page() {
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (!id) return;

        /*
        const subscription_hospitals = supabase
            .channel('hospitals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'hospitals',
                    filter: `id=eq.${id}`,
                },
                async (payload) => {
                    console.log('Received realtime update:', payload);
                    const updatedHospital = payload.new;
                    setHospital(updatedHospital);
                }
            )
            .subscribe();
            */

        const subscription_requests = supabase
            .channel('requests_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'requests',
                    filter: `hospital_id=eq.${id}`,
                },
                (payload) => {
                    console.log('Received realtime update:', payload);
                    loadRequests();
                }
            )
            .subscribe();

        const init = async () => {
            setHospital(await getHospital(id));
            setRequests(await getRequests(id, 'hospital_id'));
        };
        init();

        return () => {
            //supabase.removeChannel(subscription_hospitals);
            supabase.removeChannel(subscription_requests);
        };
    }, [id]);

    const loadRequests = async () => {
        const updatedRequests = await getRequests(id, 'hospital_id');
        setRequests(updatedRequests);
    };

    const accept = async (request) => {
        //const newPatients = [...hospital.patients, request.patient_id.toString()];
        //const newRequests = hospital.requests.filter(id => id != request.patient_id);
        //await updateHospital({ ...hospital, patients: newPatients, requests: newRequests });
        await updateRequest({ ...request, status: 'accepted' });
    };

    const deny = async (request) => {
        //const newRequests = hospital.requests.filter(id => id != request.patient_id);
        //await updateHospital({ ...hospital, requests: newRequests });
        await updateRequest({ ...request, status: 'deny' });
    };

    const complete = async (request) => {
        //const newPatients = hospital.patients.filter(p => p != patient.id);
        //await updateHospital({ ...hospital, patients: newPatients });
    };

    if (!hospital) return <div>Loading...</div>;

    return (
        <div>
            <div>
                <h1>{hospital.name}</h1>
                <div>

                    <h3>요청</h3>
                    {requests && requests.filter((item) => item.status == 'pending').map((request, index) => (
                        <div key={request.id} className="card">
                            <p>{request.patient_data.age}세 {request.patient_data.gender}</p>
                            <p>이름: {request.patient_data.name}</p>
                            <p>{request.patient_data.category} ▷ {request.patient_data.subcategory} ▷ {request.patient_data.symptom} (Pre-KTAS: {request.patient_data.ktasCode})</p>
                            <div className="button-group">
                                <button onClick={() => accept(request)}>수락</button>
                                <button onClick={() => deny(request)}>거부</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Spacer />

            <div>
                <h3>선택 대기 중</h3>
                {requests && requests.filter((item) => item.status == 'accepted').map((request, index) => (
                    <div key={request.id} className="card">
                        <p>{request.patient_data.age}세 {request.patient_data.gender}</p>
                        <p>이름: {request.patient_data.name}</p>
                        <p>{request.patient_data.category} ▷ {request.patient_data.subcategory} ▷ {request.patient_data.symptom} (Pre-KTAS: {request.patient_data.ktasCode})</p>
                        <div className="button-group">
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h3>이송 중</h3>
                {requests && requests.filter((item) => item.status == 'completed').map((request, index) => (
                    <div key={request.id} className="card">
                        <p>{request.patient_data.age}세 {request.patient_data.gender}</p>
                        <p>이름: {request.patient_data.name}</p>
                        <p>{request.patient_data.category} ▷ {request.patient_data.subcategory} ▷ {request.patient_data.symptom} (Pre-KTAS: {request.patient_data.ktasCode})</p>
                    </div>
                ))}
            </div>
        </div>
    );
}