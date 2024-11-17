import { useState, useEffect, useRef } from "react";
import Spacer from "../../../components/spacer";
import IonIcon from '@reacticons/ionicons';
import toast from 'react-hot-toast';

export default function ProfileForm({ context, history, location }) {
    const [patientId, setPatientId] = useState<number | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const handleNameChange = (context, history) => {
        if (nameInputRef.current) {
            const inputValue = nameInputRef.current.value;
            const normalizedValue = inputValue.normalize("NFC");
            history.replace("인적사항입력", { ...context, name: normalizedValue });
        }
    };

    const generatePatientId = () => {
        const newId = Math.floor(10000000 + Math.random() * 90000000);
        setPatientId(newId);
        return newId;
    };

    useEffect(() => {
        if (location) {
            history.replace("인적사항입력", { ...context, location });
        }
    }, [location]);


    return (
        <main style={{ height: '100dvh', overflow: 'scroll', paddingBottom: '100px' }}>
            <h2>환자 등록</h2>

            <Spacer y={5} />
            <span style={{ opacity: .7 }}>병원에 공유할 환자 정보를 다음 양식에 맞게 입력해주세요.</span>
            <Spacer y={30} />

            <div style={{ display: "flex", flexDirection: "column" }}>
                <label>이름</label>
                <input
                    type="text"
                    ref={nameInputRef}
                    defaultValue={context.name || ''}
                    onChange={() => handleNameChange(context, history)}
                    autoComplete="off"
                />

                <Spacer y={20} />

                <label>나이(연령대)*</label>
                <input
                    type="number"
                    value={context.age || ''}
                    onChange={(e) => history.replace("인적사항입력", { ...context, age: Number(e.target.value) })}
                    required
                    autoComplete="off"
                />
                <Spacer y={5} />
                <span style={{ opacity: .5, fontSize: '12px' }}>
                    <IonIcon className="icon" name="alert-circle-outline" />
                    &nbsp;인적사항을 확인할 수 없는 경우 대략적인 연령대 입력하거나 성인 여부(15세)만 입력
                </span>

                <Spacer y={20} />
                <label>성별*</label>
                <div className="buttons-horz" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {["남성", "여성", "미상"].map((gender) => (
                        <button
                            key={gender}
                            className={context.gender === gender ? "active" : "disabled"}
                            onClick={() => history.replace("인적사항입력", { ...context, gender: gender as "남성" | "여성" | "미상" })}
                        >
                            {gender}
                        </button>
                    ))}
                </div>

                <Spacer y={20} />
                <label>국적*</label>
                <div className="buttons-horz" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                    {["내국인", "외국인", "미상"].map((citizenship) => (
                        <button
                            key={citizenship}
                            className={context.citizenship === citizenship ? "active" : "disabled"}
                            onClick={() => history.replace("인적사항입력", { ...context, citizenship: citizenship as "내국인" | "외국인" | "미상" })}
                        >
                            {citizenship}
                        </button>
                    ))}
                </div>
            </div>


            <button
                className="bottom"
                onClick={() => {
                    if (context.age && context.gender && context.citizenship) { // 필수값
                        const id = patientId || generatePatientId();
                        history.push("증상입력", { ...context, id });
                    } else {
                        toast.error("필수 항목을 모두 입력해주세요.");
                    }
                }}
            >
                확인
            </button>
        </main>
    )
}