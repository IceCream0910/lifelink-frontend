import React from 'react';
import Spacer from "../../../../components/spacer";

const RequestCard = ({ request, index, onAccept, onDeny, simplified }) => {
    const ktasColor = (severity) => {
        switch (severity) {
            case 1:
                return { color: 'red' };
            case 2:
                return { color: 'orange' };
            case 3:
                return { color: 'purple' };
            case 4:
                return { color: 'green' };
            case 5:
                return { color: 'blue' };
            default:
                return { color: 'gray' };
        }
    };

    return simplified ?
        <div className='card' key={request.id || index}>
            <p style={{ fontSize: '14px', fontWeight: '500' }}>{request.patient_data.age}세 {request.patient_data.gender} {request.patient_data.name}</p>
            <p style={{ opacity: .5, fontSize: '13px' }}>{request.patient_data.category} ▷ {request.patient_data.subcategory}</p>
        </div> :
        <div className='card' key={request.id || index}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '4px' }}>{request.patient_data.age}세 {request.patient_data.gender} <span style={{ fontWeight: '100' }}>{request.patient_data.name}</span>
                <span style={{ fontWeight: '100', fontSize: '13px', float: 'right', opacity: .7, marginTop: '2px' }}>{Math.round(request.distance / 1000 * 10) / 10} km</span>
            </h3>
            <p style={{ opacity: .8, fontSize: '14px' }}>{request.patient_data.category} ▷ {request.patient_data.subcategory} ▷ {request.patient_data.symptom}</p>
            <Spacer y={10} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'end' }}>
                {request.patient_data.ktasCode && request.patient_data.ktasCode.substring(0, 5) == '00000' ?
                    <>
                        <p style={{ opacity: .8, fontSize: '14px', width: '100%', marginBottom: '5px', ...ktasColor(Number(request.patient_data.ktasCode.substring(5, 6))) }}>{request.patient_data.ktasCode.substring(5, 6)}단계</p>
                    </> :
                    <p style={{ opacity: .8, fontSize: '14px', width: '100%', marginBottom: '5px', ...ktasColor(request.patient_data.severity) }}>{request.patient_data.ktasCode}</p>
                }
                {onAccept && <button onClick={() => onAccept(request)} style={{ backgroundColor: '#c0f0de', color: '#007d3e', minWidth: '50px' }}>수락</button>}
                {onDeny && <button onClick={() => onDeny(request)} style={{ backgroundColor: '#ffe3e3', color: '#d12626', minWidth: '50px' }}>거절</button>}
            </div>
        </div>;
};

export default RequestCard;