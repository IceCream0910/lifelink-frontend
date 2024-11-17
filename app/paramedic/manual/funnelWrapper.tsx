"use client";
import { useFunnel } from "@use-funnel/browser";
import type { profile, preKtas, finding, complete } from "./context";
import { useState } from "react";
import ProfileForm from "./funnels/ProfileForm";
import SymptomForm from "./funnels/SymptomForm";
import HospitalForm from "./funnels/HospitalForm";
import CompleteScreen from "./funnels/CompleteScreen";


export default function Home() {
    const [hospitals, setHospitals] = useState<any>([]);
    const [location, setLocation] = useState<string | null>(localStorage.getItem('lifelink_patient_location'));

    const funnel = useFunnel<{
        "인적사항입력": Partial<profile>;
        "증상입력": Partial<preKtas>;
        "요청전송": Partial<finding>;
        "매칭완료": Partial<complete>;
    }>({
        id: "patient-funnel",
        initial: {
            step: "인적사항입력",
            context: {}
        }
    });

    return (
        <funnel.Render
            인적사항입력={({ context, history }) => (
                <ProfileForm context={context} history={history} location={location} />
            )}

            증상입력={({ context, history }) => (
                <SymptomForm context={context} history={history} setHospitals={setHospitals} />
            )}

            요청전송={({ context, history }) => (
                <HospitalForm context={context} history={history} />
            )}

            매칭완료={({ context, history }) => (
                <CompleteScreen context={context} history={history} />
            )}
        />
    );
}