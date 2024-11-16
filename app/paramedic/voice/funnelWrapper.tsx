"use client";
import { useFunnel } from "@use-funnel/browser";
import type { voiceForm, finding, complete } from "./context";
import { useState } from "react";
import VoiceForm from "./funnels/VoiceForm";
import HospitalForm from "./funnels/HospitalForm";
import CompleteScreen from "./funnels/CompleteScreen";


export default function Home() {
    const [hospitals, setHospitals] = useState<any>([]);
    const [location, setLocation] = useState<string | null>(null);

    const funnel = useFunnel<{
        "음성입력": Partial<voiceForm>;
        "요청전송": Partial<finding>;
        "매칭완료": Partial<complete>;
    }>({
        id: "voice-patient-funnel",
        initial: {
            step: "음성입력",
            context: {}
        }
    });

    return (
        <funnel.Render
            음성입력={({ context, history }) => (
                <VoiceForm context={context} history={history} location={location} setLocation={setLocation} />
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