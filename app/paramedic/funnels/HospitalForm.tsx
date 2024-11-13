import { useState, useEffect } from "react";
import Spacer from "../../components/spacer";
import 'react-spring-bottom-sheet/dist/style.css';
import { finding, complete } from "../context";
import { supabase } from "../../utils/supabase";
import getRequests from "../../utils/getRequests";
import deleteRequest from "../../utils/deleteRequest";
import updateRequest from "../../utils/updateRequest";

export default function HospitalForm({ context, history }) {
    const [requests, setRequests] = useState<any>(null);

    useEffect(() => {
        if (!context.id) return;

        const init = async () => {
            setRequests(await getRequests(context.id, 'patient_id'));
        };

        init();

        const channel = supabase.channel(`patient-${context.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'requests',
                    filter: `patient_id=eq.${context.id}`
                },
                async (payload) => {
                    await loadRequests();
                }
            )
            .subscribe();


        return () => {
            supabase.removeChannel(channel);
        };
    }, [context.id]);

    const loadRequests = async () => {
        const updatedRequests = await getRequests(context.id, 'patient_id');
        setRequests(updatedRequests);
    };

    const completeMatch = async (request) => {
        await updateRequest({ ...request, status: 'completed' });
        await deleteRequest(context.id, 'patient_id');

        await history.push("매칭완료", {
            ...context,
            hospitalId: request.hospital_id,
            hospitalName: request.hospital_data.name,
            hospitalLat: request.hospital_data.lat,
            hospitalLong: request.hospital_data.long
        } as complete);
    };

    const cancelRequest = async () => {
        await deleteRequest(context.id, 'patient_id');
        history.push("인적사항입력", {});
    };

    return (
        <main>
            <h2>이송할 병원을 찾고 있어요.</h2>

            <Spacer y={30} />
            <label>요청 환자 정보</label>
            <div className="card">
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <h4>{context.name || "이름 미상"}</h4>
                    <Spacer x={5} /><span style={{ opacity: .3 }}>|</span><Spacer x={5} />
                    <span style={{ opacity: .7 }}>{context.age || "미상"}세 {context.citizenship || "미상"} {context.gender || "미상"}</span>
                </div>
                <span style={{ fontSize: '14px', opacity: .7 }}>
                    {context.category} ▷ {context.subcategory} ▷ {context.symptom} (Pre-KTAS: {context.ktasCode})
                </span>
            </div>

            <Spacer y={20} />
            <label>찾은 병원</label>

            {requests && requests.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {requests.map(request => (
                        <div key={request.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <h4>{request.hospital_data.name}</h4>
                                <span style={{ fontSize: '14px', opacity: .7 }}>
                                    {Math.round(request.distance / 1000 * 10) / 10} km
                                </span>
                            </div>

                            <div style={{ float: 'right' }}>
                                {request.status === 'pending' ? (
                                    <button style={{ background: '#e6e6e6', color: '#000' }} disabled>응답 대기중</button>
                                ) : (
                                    request.status === 'accepted' ? (
                                        <button onClick={() => completeMatch(request)} style={{ background: 'var(--primary)', color: '#fff' }}>여기로 이송</button>
                                    ) : (
                                        <button style={{ background: '#ffe3e3', color: 'var(--danger)' }} disabled>거절됨</button>
                                    )
                                )}

                            </div>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <span>주변에서 요청 가능한 병원을 찾지 못했어요.</span>
                </div>
            )}

            <button
                className="bottom disabled"
                onClick={() => cancelRequest()}>
                요청 취소
            </button>
        </main>
    );
}