"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Spacer from "../../components/spacer";
import IonIcon from "@reacticons/ionicons";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        kakao: any;
    }
}

export default function Home() {
    const router = useRouter();
    const [location, setLocation] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);

    useEffect(() => {

        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationString = `POINT(${longitude} ${latitude})`;
                    console.log('Location:', locationString);
                    setLocation(locationString);

                    // 좌표를 주소로 변환
                    convertCoordToAddress(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };

    const convertCoordToAddress = (latitude: number, longitude: number) => {
        if (window.kakao && window.kakao.maps) {
            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const addressResult = result[0];
                    if (addressResult) {
                        const roadAddress = addressResult.road_address
                            ? addressResult.road_address.address_name
                            : addressResult.address.address_name;
                        setAddress(roadAddress);
                    }
                } else {
                    console.error('Error converting coordinates to address');
                }
            });
        }
    };

    useEffect(() => {
        if (location) {
            localStorage.setItem('lifelink_patient_location', location);
        }
    }, [location]);

    return (
        <main>
            <h2>환자 등록</h2>
            <Spacer y={5} />
            <span style={{ opacity: .7 }}>병원에 공유할 환자 정보를 입력할 방식을 선택해주세요.</span>
            <Spacer y={10} />
            <span style={{ color: 'var(--primary-text)' }}><IonIcon className="icon" name="navigate-circle-outline" /> {address}</span>

            <div style={{ position: 'fixed', bottom: '30px', right: 0, padding: '20px' }}>
                <div className="card clickable" onClick={() => router.push('/paramedic/voice')} >
                    <h3>음성으로 입력
                        <IonIcon className="icon" style={{ float: 'right' }} name="chevron-forward" />
                    </h3>
                    <Spacer y={5} />

                    <p style={{ opacity: .7, fontSize: '14px' }}>환자의 정보를 음성으로 입력합니다.<br />빠르게 환자를 등록할 수 있지만, Pre-KTAS 코드 전체가 아닌 중증도 분류만 자동 진행됩니다.</p>
                </div>
                <Spacer y={20} />
                <div className="card clickable" onClick={() => router.push('/paramedic/manual')} >
                    <h3>직접 입력
                        <IonIcon className="icon" style={{ float: 'right' }} name="chevron-forward" />
                    </h3>
                    <Spacer y={5} />
                    <p style={{ opacity: .7, fontSize: '14px' }}>환자의 정보를 정해진 양식에 직접 입력합니다.<br />환자의 상태를 정확하게 분류하여 병원에 공유할 수 있습니다.</p>
                </div>
            </div>
        </main>
    );
}