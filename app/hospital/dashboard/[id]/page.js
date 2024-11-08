"use client";
import { useParams } from 'next/navigation'

import { useEffect, useState } from 'react';
import getHospital from '../../../utils/getHospital';

import getPatient from '../../../utils/getPatient';

import Spacer from '../../../components/spacer';
import updateHospital from '../../../utils/updateHospital';


export default function Page() {
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [requests, setRequests] = useState([]);
    const [patients, setPatients] = useState([]);


    useEffect(() => {
        const init = async () => {
            setHospital(await getHospital(id));
        };

        init();
    }, [id]);

    useEffect(() => {
        const init = async () => {
            if (!hospital) return;

            const requestData = await Promise.all(hospital.requests.map(request => getPatient(request)));
            setRequests(requestData);

            const patientData = await Promise.all(hospital.patients.map(patient => getPatient(patient)));
            setPatients(patientData);
        };

        init();
    }, [hospital]);

    const accept = async (patient) => {
        const newRequests = hospital.requests.filter(request => request != patient.id);
        const newPatients = [...hospital.patients, patient.id];
        updateHospital({ ...hospital, requests: newRequests, patients: newPatients });
    }

    const deny = async (patient) => {
        const newRequests = hospital.requests.filter(request => request != patient.id);
        updateHospital({ ...hospital, requests: newRequests });
    }

    const complete = async (patient) => {
        const newPatients = hospital.patients.filter(p => p != patient.id);
        updateHospital({ ...hospital, patients: newPatients });
    }


    if (!hospital) return <div>Loading...</div>;

    return (
        <main>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ flex: 2 }}>

                    <h1>{hospital.name}</h1>

                    <Spacer y={20} />

                    <h3>우리 병원으로 이송을 원하는 환자가 {hospital.requests.length}명 있어요.</h3>

                    <Spacer y={20} />


                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

                        {requests.map((patient, index) => (
                            <div key={index} className='card'>
                                <h4>{patient.age}세 {patient.gender}</h4>
                                <p>이름: {patient.name}</p>
                                <p>{patient.category} ▷ {patient.subcategory} ▷ {patient.symptom} (Pre-KTAS: {patient.ktasCode})</p>

                                <button onClick={() => accept(patient)}>수락</button>
                                <button onClick={() => deny(patient)}>거부</button>
                            </div>

                        ))}

                    </div>


                </div>

                <div style={{ flex: 1 }}>
                    <h3>우리 병원으로 이송 중인 환자가 {hospital.patients.length}명 있어요.</h3>

                    <Spacer y={20} />
                    {patients.map((patient, index) => (
                        <div key={index} className='card'>
                            <h4>{patient.age}세 {patient.gender}</h4>
                            <p>이름: {patient.name}</p>
                            <p>{patient.category} ▷ {patient.subcategory} ▷ {patient.symptom} (Pre-KTAS: {patient.ktasCode})</p>
                            <button onClick={() => complete(patient)}>이송 완료</button>
                        </div>
                    ))}


                </div>

            </div>

        </main>

    )
}