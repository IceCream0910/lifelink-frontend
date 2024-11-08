"use client";
import "../style.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import getHospital from '../../utils/getHospital';
import addHospital from '../../utils/addHospital';
import IonIcon from "@reacticons/ionicons";

export default function Page() {
    const router = useRouter();
    const [hospital, setHospital] = useState(null);

    useEffect(() => {
        const init = async () => {
            setHospital(await getHospital());
        };

        init();
    }, []);

    useEffect(() => {
        if (hospital) {
            console.log(hospital);
        }
    }, [hospital]);

    const generateHospitalId = () => {
        const newId = Math.floor(10000000 + Math.random() * 90000000);
        return newId;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: "center", alignItems: 'center', background: 'radial-gradient(circle at left, #90ffc7 0%, transparent 100%)' }}>
            <div style={{ width: '100%', height: '100dvh', display: 'flex', justifyContent: "center", alignItems: 'center', flex: 1, textAlign: 'center', flexDirection: 'column' }}>
                <h1>LifeLink에 오신 것을 환영합니다.</h1><br />
                <span>주변에 있는 구급차와 연결하기 위해서, 현재 근무중인 병원을 선택해주세요.</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
                {hospital && hospital.map((h, index) => (
                    <button className="option" style={{ margin: "5px" }} key={index} onClick={() => {
                        localStorage.setItem('selectedHospital', h.id)
                        router.push('/hospital/dashboard');
                    }}>
                        {h.name}
                    </button>
                ))}
                <button className="option" style={{ margin: "5px" }} onClick={async () => {
                    // TODO: 병원 등록 UI 구현
                    return;
                    const name = await prompt('병원 이름을 입력해주세요.');
                    if (!name || !location) return;
                    const data = {
                        name,
                        id: await generateHospitalId(),
                        patients: [],
                        requests: [],
                        location: `POINT(${location.split[0]} ${location.split[1]})`
                    };
                    addHospital(data);
                }}>
                    <IonIcon name="add" className="icon" />&nbsp;
                    병원 추가하기
                </button>
            </div>
        </div>
    );
}