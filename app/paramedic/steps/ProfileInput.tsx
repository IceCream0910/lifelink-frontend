import { FunnelProps } from "./funnelTypes";
import { profile } from "../context";
import IonIcon from '@reacticons/ionicons';
import Spacer from "../../components/spacer";
import toast from 'react-hot-toast';

export default function ProfileInput({ context, history }: FunnelProps<Partial<profile>>) {
    return (
        <main>
            <h2>환자 등록</h2>
            <span>병원에 공유하기 위한 환자의 정보를 입력해주세요.</span>
            <Spacer y={10} />
            <span style={{ opacity: .5, fontSize: '14px' }}>
                <IonIcon className="icon" name="alert-circle-outline" />
                &nbsp;인적사항을 확인할 수 없는 경우 빈칸으로 유지
            </span>
            <Spacer y={30} />

            <div style={{ display: "flex", flexDirection: "column" }}>
                <label>이름</label>
                <input
                    type="text"
                    value={context.name || ''}
                    onChange={(e) => history.replace("인적사항입력", { ...context, name: e.target.value })}
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
                    if (context.age && context.gender && context.citizenship) {
                        history.push("증상입력", context);
                    } else {
                        toast.error("필수 항목을 모두 입력해주세요.");
                    }
                }}
            >
                확인
            </button>
        </main>
    );
}