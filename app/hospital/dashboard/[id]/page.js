"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import getHospital from '../../../utils/getHospital';
import getRequests from '../../../utils/getRequests';
import Spacer from '../../../components/spacer';
import updateHospital from '../../../utils/updateHospital';
import updateRequest from '../../../utils/updateRequest';
import { supabase } from '../../../utils/supabase';
import RequestCard from './components/requestCard';
import IonIcon from '@reacticons/ionicons';

export default function Page() {
    const { id } = useParams();
    const [hospital, setHospital] = useState(null);
    const [requests, setRequests] = useState([]);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const cardsContainerRef = useRef(null);

    useEffect(() => {
        const cardsContainer = cardsContainerRef.current;
        if (cardsContainer) {
            const hasHorizontalScrollbar =
                cardsContainer.scrollWidth > cardsContainer.clientWidth;
            setShowScrollButtons(hasHorizontalScrollbar);
        }
    }, [requests]);

    const handleScrollLeft = () => {
        cardsContainerRef.current.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
        setScrollPosition(cardsContainerRef.current.scrollLeft);
    };

    const handleScrollRight = () => {
        cardsContainerRef.current.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
        setScrollPosition(cardsContainerRef.current.scrollLeft);
    };

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
        <main style={{ overflow: 'hidden', padding: '2em' }}>
            <h1>{hospital.name}</h1>
            <Spacer y={20} />
            <div style={{ width: '72%', height: '95dvh' }}>
                <h3>이송 요청</h3> <Spacer y={15} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', height: '100%', overflow: 'scroll', paddingBottom: '500px' }}>
                    {requests && requests.filter((item) => item.status == 'pending').map((request, index) => (
                        <RequestCard key={request.id || index} request={request} onAccept={accept} onDeny={deny} />
                    ))}
                    {requests && requests.filter((item) => item.status == 'pending').length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>이송 요청이 없습니다.</p>
                    )}
                </div>

            </div>

            <div style={{ position: 'fixed', top: 0, right: 0, background: 'var(--background)', width: '27%', padding: '2em', height: '100%' }}>
                <h3>우리 병원으로 이송 중</h3><Spacer y={20} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowY: 'scroll', paddingBottom: '50px' }}>
                    {requests && requests.filter((item) => item.status == 'completed').map((request, index) => (
                        <RequestCard key={request.id || index} request={request} />
                    ))}
                    {requests && requests.filter((item) => item.status == 'completed').length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>이송 중인 환자가 없습니다.</p>
                    )}
                </div>
            </div>





            <div style={{ position: 'fixed', bottom: 0, left: 0, right: '28%', padding: '2em', background: 'linear-gradient(to bottom, transparent, var(--background) 30%)' }}>
                <Spacer y={30} />
                <h3>확정 대기 중</h3>
                <Spacer y={15} />
                <div
                    ref={cardsContainerRef}
                    style={{
                        width: '100% !important',
                        display: 'inline-display',
                        whiteSpace: 'nowrap',
                        overflowX: 'scroll',
                    }}
                >
                    {requests && requests.filter((item) => item.status === 'accepted').map((request, index) => (
                        <div key={request.id || index} style={{ display: 'inline-block', marginRight: '15px' }}>
                            <RequestCard key={request.id || index} request={request} simplified={true} />
                        </div>
                    ))}
                    {requests && requests.filter((item) => item.status === 'accepted').length === 0 && (
                        <p style={{ color: 'var(--text-muted)' }}>확정 대기 중인 환자가 없습니다.</p>
                    )}
                </div>
                {showScrollButtons && scrollPosition > 0 && (
                    <button
                        onClick={handleScrollLeft}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: 'translateY(30%)',
                            backgroundColor: 'white',
                            color: '#000',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <IonIcon name="chevron-back" />
                    </button>
                )}
                {showScrollButtons && (
                    <button
                        onClick={handleScrollRight}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '20px',
                            transform: 'translateY(30%)',
                            backgroundColor: 'white',
                            color: '#000',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <IonIcon name="chevron-forward" />
                    </button>
                )}
            </div>
        </main>
    );
}