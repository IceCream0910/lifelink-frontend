"use client";
import Image from "next/image";
import Spacer from "../components/spacer";
import IonIcon from '@reacticons/ionicons';
import { useFunnel } from "@use-funnel/browser";
import type { profile, preKtas, finding, complete, KtasSymptom } from "./context";
import toast from 'react-hot-toast';
import ktasData from './ktas.json';
import { useState, useRef, useEffect } from "react";
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import addPatient from '../utils/add';
import sendRequests from '../utils/sendRequests';


type SelectionState = {
  category: string;
  subcategory: string;
  symptom: KtasSymptom | null;
};

export default function Home() {
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

  const [selection, setSelection] = useState<SelectionState>({
    category: '',
    subcategory: '',
    symptom: null
  });

  const [openSheet, setOpenSheet] = useState<'category' | 'subcategory' | 'symptom' | null>(null);

  // KTAS 코드 생성
  const generateKtasCode = (context: Partial<preKtas>, symptom: KtasSymptom | null) => {
    if (!selection.category || !selection.subcategory || !symptom || !context.age) {
      return '------';
    }

    const agePrefix = context.age >= 15 ? 'A' : 'B';
    const categoryCode = ktasData[context.age >= 15 ? 'adult' : 'child'][selection.category].code;
    const subcategoryCode = ktasData[context.age >= 15 ? 'adult' : 'child'][selection.category].subcategories[selection.subcategory].code;

    return `${agePrefix}${categoryCode}${subcategoryCode}${symptom.code}${symptom.severity}`;
  };

  // 선택 옵션 목록
  const getCategories = (age?: number) =>
    age ? Object.keys(ktasData[age >= 15 ? 'adult' : 'child']) : [];

  const getSubcategories = (age?: number) =>
    age && selection.category ?
      Object.keys(ktasData[age >= 15 ? 'adult' : 'child'][selection.category].subcategories) : [];

  const getSymptoms = (age?: number) =>
    age && selection.category && selection.subcategory ?
      ktasData[age >= 15 ? 'adult' : 'child'][selection.category].subcategories[selection.subcategory].symptoms : [];

  const nameInputRef = useRef<HTMLInputElement>(null);
  const handleNameChange = (context, history) => {
    if (nameInputRef.current) {
      const inputValue = nameInputRef.current.value;
      const normalizedValue = inputValue.normalize("NFC");
      history.replace("인적사항입력", { ...context, name: normalizedValue });
    }
  };


  const [location, setLocation] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<any>([]);
  const [patientId, setPatientId] = useState<number | null>(null);

  const generatePatientId = () => {
    const newId = Math.floor(10000000 + Math.random() * 90000000);
    setPatientId(newId);
    return newId;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `POINT(${longitude} ${latitude})`;
          console.log('Location:', locationString);
          setLocation(locationString);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  useEffect(() => {
    if (location) {
      funnel.context.location = location
    }
  }, [location]);



  return (
    <funnel.Render
      인적사항입력={({ context, history }) => (
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
                getCurrentLocation();
              } else {
                toast.error("필수 항목을 모두 입력해주세요.");
              }
            }}
          >
            확인
          </button>
        </main>
      )}

      증상입력={({ context, history }) => (
        <main>
          <h2>환자 상태 입력</h2>
          <span>병원에 공유하기 위한 환자의 상태를 입력해주세요.</span>
          <Spacer y={10} />
          <span style={{ opacity: .5, fontSize: '14px' }}>
            <IonIcon className="icon" name="alert-circle-outline" />&nbsp;환자 상태를 단계 별로 선택하면 Pre-KTAS 코드가 자동으로 분류됩니다. 음성으로 환자 상태를 입력한 경우 KTAS 코드 대신 브리핑 내용 및 요약본이 전달됩니다.
          </span>
          <Spacer y={20} />

          <label>대분류</label>
          <button
            className="selector"
            onClick={() => context.age && setOpenSheet('category')}
          >
            {selection.category || '선택하세요'}
          </button>
          <Spacer y={15} />

          <label>소분류</label>
          <button
            className="selector"
            onClick={() => selection.category ? setOpenSheet('subcategory') : toast.error("대분류를 먼저 선택해주세요.")}
          >
            {selection.subcategory || '선택하세요'}
          </button>
          <Spacer y={15} />

          <label>세부 증상</label>
          <button
            className="selector"
            onClick={() => selection.subcategory ? setOpenSheet('symptom') : toast.error("소분류를 먼저 선택해주세요.")}
          >
            {selection.symptom?.name || '선택하세요'}
          </button>
          <Spacer y={25} />

          <label>Pre-KTAS</label>
          <div className="card" style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {generateKtasCode(context, selection.symptom).split('').map((digit, i) => (
              <div key={i} className="digit">{digit}</div>
            ))}
          </div>

          <Spacer y={70} />

          <BottomSheet
            open={openSheet === 'category'}
            onDismiss={() => setOpenSheet(null)}
          >
            <div style={{ padding: '20px', maxHeight: '80dvh', overflowY: 'scroll' }}>
              {getCategories(context.age).map(category => (
                <button
                  className="option"
                  key={category}
                  onClick={() => {
                    setSelection({ category, subcategory: '', symptom: null });
                    setOpenSheet(null);
                  }}
                  style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0' }}
                >
                  {category}
                </button>
              ))}
            </div>
          </BottomSheet>

          <BottomSheet
            open={openSheet === 'subcategory'}
            onDismiss={() => setOpenSheet(null)}
          >
            <div style={{ padding: '20px', maxHeight: '80dvh', overflowY: 'scroll' }}>
              {getSubcategories(context.age).map(subcategory => (
                <button
                  className="option"
                  key={subcategory}
                  onClick={() => {
                    setSelection(prev => ({ ...prev, subcategory, symptom: null }));
                    setOpenSheet(null);
                  }}
                  style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0' }}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </BottomSheet>

          <BottomSheet
            open={openSheet === 'symptom'}
            onDismiss={() => setOpenSheet(null)}
          >
            <div style={{ padding: '20px', maxHeight: '80dvh', overflowY: 'scroll' }}>
              {getSymptoms(context.age).map(symptom => (
                <button
                  className="option"
                  key={symptom.code}
                  onClick={() => {
                    setSelection(prev => ({ ...prev, symptom }));
                    setOpenSheet(null);
                    if (context.age && context.gender && context.citizenship) {
                      const ktasCode = generateKtasCode(context, symptom);
                      history.replace("증상입력", {
                        ...context,
                        ktasCode,
                        category: selection.category,
                        subcategory: selection.subcategory,
                        symptom: symptom.name,
                        severity: symptom.severity,
                        age: context.age,
                        gender: context.gender,
                        citizenship: context.citizenship
                      });
                    }
                  }}
                  style={{ display: 'block', width: '100%', padding: '10px', margin: '5px 0' }}
                >
                  {symptom.name}
                </button>
              ))}
            </div>
          </BottomSheet>

          <button
            className="bottom"
            onClick={async () => {
              if (selection.symptom && context.age && context.gender && context.citizenship) {
                if (!context.location) {
                  toast.error("아직 현재 위치 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
                  getCurrentLocation();
                  return;
                }
                if (!context.id) {
                  const id = patientId || generatePatientId();
                  history.replace("증상입력", { ...context, id });
                  toast.error("환자 ID가 생성되지 않았습니다. 잠시 후 다시 시도해주세요.");
                }
                await addPatient(context as preKtas);
                setHospitals(await sendRequests(context as preKtas));
                history.push("요청전송", context as preKtas);
              } else {
                toast.error("환자 상태를 모두 입력해주세요.");
              }
            }}
          >
            근처 병원에 수용 요청 보내기
          </button>
        </main>
      )}

      요청전송={({ context, history }) => (
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
      )}

      매칭완료={({ context }) => (
        <main>
          <h2>매칭 완료</h2>
          {/* 매칭 완료 UI 구현 */}
        </main>
      )}
    />
  );
}
