import { useState } from "react";
import Spacer from "../../components/spacer";
import 'react-spring-bottom-sheet/dist/style.css'
import { preKtas } from "../context";


export default function HospitalForm({ context, history, hospitals }) {
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
                <span style={{ fontSize: '14px', opacity: .7 }}>{context.category} ▷ {context.subcategory} ▷ {context.symptom} (Pre-KTAS: {context.ktasCode})</span>
            </div>

            <Spacer y={20} />
            <label>찾은 병원</label>

            {hospitals.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {hospitals.map(hospital => (
                        <div key={hospital.id} className="card">
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <h4>{hospital.name}</h4>
                            </div>
                            <span style={{ fontSize: '14px', opacity: .7 }}>주소</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <span>주변에서 요청 가능한 병원을 찾지 못했어요.</span>
                </div>
            )}


        </main>
    )
}