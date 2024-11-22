"use client";
import { useState, useEffect, useRef } from "react";
import Spacer from "../../../components/spacer";
import IonIcon from '@reacticons/ionicons';
import toast from 'react-hot-toast';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import TextTransition from "../components/TextTransition";
import { voiceForm } from "../context";
import addPatient from '../../../utils/add';
import sendRequests from '../../../utils/sendRequests';
import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';

export default function VoiceForm({ context, history, location }) {
    const [patientId, setPatientId] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [openSheet, setOpenSheet] = useState(false);
    const [processedResult, setProcessedResult] = useState<any>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const generatePatientId = () => {
        const newId = Math.floor(10000000 + Math.random() * 90000000);
        setPatientId(newId);
        return newId;
    };

    useEffect(() => {
        if (location) {
            history.replace("음성입력", { ...context, location });
        }
    }, [location]);

    const startRecording = async () => {
        try {
            resetTranscript();
            await SpeechRecognition.startListening({ continuous: true, language: 'ko-KR' });
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('음성 인식을 시작할 수 없습니다.');
        }
    };

    const sendToLLM = async (transcript: string) => {
        try {
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash-002",
                systemInstruction: "환자 브리핑 음성 발화가 주어지면, 이를 바탕으로 JSON 데이터를 작성해서 반환해.\n\npatient_age가 구체적으로 명시되지 않은 경우, 대략적인 나이대를 추정해서 작성해(예를 들어 20대인경우 20으로 반환).\npatient_gender는 \"남성\", \"여성\" \"미상\" 중 하나여야 해.\npatient_citizenship는 \"내국인\", \"외국인\", \"미상\" 중 하나여야 해. 별도 언급이 없는 경우 \"내국인\"으로 반환해.\npatient_name이 명시되어 있지 않은 경우 \"미상\"으로 반환해.\npatient_symptom_summary는 브리핑 내용을 바탕으로 최대한 간결하면서도 의학적으로 서술해.\nseverity는 1~5의 정수여야 해."
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        severity: { type: "integer" },
                        patient_name: { type: "string" },
                        patient_age: { type: "number" },
                        patient_gender: { type: "string" },
                        paitent_symptom_summary: { type: "string" },
                        patient_citizenship: { type: "string" }
                    },
                    required: [
                        "severity",
                        "patient_name",
                        "patient_age",
                        "patient_gender",
                        "paitent_symptom_summary",
                        "patient_citizenship"
                    ]
                },
            };

            const chatSession = model.startChat({ generationConfig });
            const result = await chatSession.sendMessage(transcript);
            const response = JSON.parse(result.response.text());
            return response;
        } catch (error) {
            console.error('LLM Error:', error);
            throw new Error('AI 모델 처리 중 오류가 발생했습니다.');
        }
    };

    const stopRecording = async () => {
        SpeechRecognition.stopListening();
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }


        setIsRecording(false);
        if (!transcript) {
            toast.error('인식된 내용이 없습니다. 다시 시도해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            const result = await sendToLLM(transcript);
            const id = patientId || generatePatientId();

            const patient: voiceForm = {
                id,
                name: result.patient_name,
                age: result.patient_age,
                symptom: result.paitent_symptom_summary,
                gender: result.patient_gender,
                citizenship: result.patient_citizenship,
                ktasCode: `00000${result.severity}`,
                location: context.location
            };

            setProcessedResult(patient);
            setOpenSheet(true);
        } catch (error) {
            console.error('Error processing voice data:', error);
            toast.error('음성 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
            resetTranscript();
        }
    };

    const handleConfirm = async () => {
        try {
            if (!processedResult) return;
            console.log(context)
            context = processedResult;
            await addPatient(context);
            await sendRequests(context);
            history.push("요청전송", { ...context });
        } catch (error) {
            console.error('Error confirming patient:', error);
            toast.error('환자 정보 처리 중 오류가 발생했습니다.');
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    return (
        <main style={{ height: '100dvh', overflow: 'scroll', paddingBottom: '100px' }}>
            <h2>환자 등록</h2>
            <span>병원에 공유하기 위한 환자의 정보를 입력해주세요.</span>
            <Spacer y={30} />

            {isRecording && transcript && (
                <TextTransition text={transcript} />
            )}

            {!transcript && (
                <p style={{ opacity: .5 }}><b>이렇게 말해보세요.</b>
                    <br />
                    20대 여성 내국인 환자로, 발열 및 호흡곤란 증상이 있습니다. 이름은 홍길동입니다.
                </p>
            )}

            {isLoading && (
                <div className="loading-container">
                    <div className="spinner" />
                    <p>음성 처리 중...</p>
                </div>
            )}

            <button
                className={`bottom voice-button ${isRecording ? 'recording' : ''}`}
                onClick={() => isRecording ? stopRecording() : startRecording()}
            >
                <IonIcon name={isRecording ? "mic" : "mic-outline"} />
                {isRecording ? '완료' : '음성으로 입력하기'}
            </button>

            <BottomSheet open={openSheet} onDismiss={() => setOpenSheet(false)}>
                <div style={{ padding: '20px', maxHeight: '80dvh', overflowY: 'scroll' }}>
                    <h3>AI가 인식한 결과를 확인해보세요.</h3>
                    <Spacer y={20} />

                    {processedResult && (
                        <>
                            <div className="info-row">
                                <label>이름</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', background: 'var(--background)' }}
                                    value={processedResult.name}
                                    onChange={(e) => setProcessedResult({
                                        ...processedResult,
                                        name: e.target.value
                                    })}
                                />
                            </div>
                            <Spacer y={10} />

                            <div className="info-row">
                                <label>나이</label>
                                <input
                                    style={{ width: '100%', background: 'var(--background)' }}
                                    type="number"
                                    value={processedResult.age}
                                    onChange={(e) => setProcessedResult({
                                        ...processedResult,
                                        age: parseInt(e.target.value)
                                    })}
                                />
                            </div>
                            <Spacer y={10} />

                            <div className="info-row">
                                <label>성별</label>
                                <select
                                    value={processedResult.gender}
                                    onChange={(e) => setProcessedResult({
                                        ...processedResult,
                                        gender: e.target.value
                                    })}
                                >
                                    <option value="남성">남성</option>
                                    <option value="여성">여성</option>
                                    <option value="미상">미상</option>
                                </select>
                            </div>
                            <Spacer y={10} />

                            <div className="info-row">
                                <label>국적</label>
                                <select
                                    value={processedResult.citizenship}
                                    onChange={(e) => setProcessedResult({
                                        ...processedResult,
                                        citizenship: e.target.value
                                    })}
                                >
                                    <option value="내국인">내국인</option>
                                    <option value="외국인">외국인</option>
                                    <option value="미상">미상</option>
                                </select>
                            </div>
                            <Spacer y={20} />

                            <div className="info-row">
                                <label>증상 요약</label>
                                <textarea
                                    value={processedResult.symptom}
                                    onChange={(e) => setProcessedResult({
                                        ...processedResult,
                                        symptom: e.target.value
                                    })}
                                    rows={4}
                                />
                            </div>
                            <Spacer y={50} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', padding: '20px', gap: '10px' }}>
                                <button
                                    style={{ width: '100%', background: 'var(--background)', color: 'var(--primary)' }}
                                    onClick={() => setOpenSheet(false)}
                                >
                                    다시 말하기
                                </button>
                                <button
                                    style={{ width: '100%' }}
                                    onClick={handleConfirm}
                                >
                                    전송
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </BottomSheet>
        </main>
    );
}