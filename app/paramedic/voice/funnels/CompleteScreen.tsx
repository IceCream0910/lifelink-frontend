import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from 'next/script';
import deleteRequest from "../../../utils/deleteRequest";
import deletePatient from "../../../utils/deletePatient";
import Spacer from "../../../components/spacer";
import IonIcon from "@reacticons/ionicons";
import deleteAllRequests from "../../../utils/deleteAllRequests";
import { Map, MapMarker, Polyline } from "react-kakao-maps-sdk";
import updateRequest from "../../../utils/updateRequest";

export default function CompleteScreen({ context, history }) {
    const router = useRouter();
    const [currentPosition, setCurrentPosition] = useState(null);
    const [path, setPath] = useState([]);
    const [map, setMap] = useState(null);

    useEffect(() => {
        let watchId;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.log(error)
            );

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => console.log(error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        }

        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, []);

    useEffect(() => {
        if (currentPosition && context.hospitalLat && context.hospitalLong) {
            fetchRoute();
        }
    }, [currentPosition, context.hospitalLat, context.hospitalLong]);

    const fetchRoute = async () => {
        const origin = `${currentPosition.lng},${currentPosition.lat}`;
        const destination = `${context.hospitalLong},${context.hospitalLat}`;
        try {
            const response = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}`, {
                headers: {
                    'Authorization': `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`
                }
            });
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].sections[0].roads.flatMap(road =>
                    road.vertexes.reduce((acc, coord, index) => {
                        if (index % 2 === 0) {
                            acc.push({ lng: coord, lat: road.vertexes[index + 1] });
                        }
                        return acc;
                    }, [])
                );
                setPath(coords);
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    const complete = () => {
        const update = async () => {
            await updateRequest({ ...context.request, status: 'deleted' });
            deleteRequest(context.id, 'patient_id');
            deletePatient(context.id);
            context = {};
            router.push("/paramedic");
        };
        update();
    }

    return (
        <main>
            <Spacer y={20} />
            {currentPosition && (
                <Map
                    center={currentPosition}
                    style={{ width: "100%", height: "100dvh", position: 'fixed', top: '0', left: 0, right: 0, zIndex: 0 }}
                    level={5}
                    onCreate={setMap}
                >
                    {/* 현재 위치 마커 */}
                    {currentPosition && (
                        <MapMarker
                            position={currentPosition}
                            image={{
                                src: "https://cdn.prod.website-files.com/62c5e0898dea0b799c5f2210/62e8212acc540f291431bad2_location-icon.png",
                                size: { width: 40, height: 40 },
                            }}
                        />
                    )}

                    {/* 출발 위치 마커 */}
                    <MapMarker
                        position={{ lat: context.location.split(' ')[1].replace(')', ''), lng: context.location.split(' ')[0].replace('POINT(', '').replace(')', '') }}
                        image={{
                            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png",
                            size: { width: 50, height: 50 },
                        }}
                    />
                    {/* 병원 위치 마커 */}
                    {context.hospitalLat && context.hospitalLong && (
                        <MapMarker
                            position={{ lat: context.hospitalLat, lng: context.hospitalLong }}
                            image={{
                                src: "https://cdn3.iconfinder.com/data/icons/clinical-3/96/medic-512.png",
                                size: { width: 25, height: 25 },
                            }}
                        />
                    )}
                    {/* 경로 라인 */}
                    {path.length > 0 && (
                        <Polyline
                            path={path}
                            strokeWeight={5}
                            strokeColor="#008cff"
                            strokeOpacity={0.9}
                            strokeStyle="solid"
                        />
                    )}
                </Map>
            )}

            <div style={{ position: 'fixed', top: '0', left: 0, right: 0, zIndex: 1, padding: '20px', height: 'fit-content', background: 'linear-gradient(to top, transparent 0%, var(--background) 70%)' }}>
                <Spacer y={10} />
                <h2>이송할 병원을 확정했어요.</h2>
                <Spacer y={20} />

                <div className="card" style={{ background: 'rgba(246, 247, 250, 0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <h4>{context.hospitalName}</h4>
                    <Spacer y={10} />
                    <div style={{ display: "flex", flexDirection: "row", fontSize: '14px' }}>
                        <h4>{context.name || "이름 미상"}</h4>
                        <Spacer x={5} />
                        <span style={{ opacity: .3 }}>|</span>
                        <Spacer x={5} />
                        <span style={{ opacity: .7 }}>{context.age || "미상"}세 {context.citizenship || "미상"} {context.gender || "미상"}</span>
                    </div>
                    <span style={{ fontSize: '13px', opacity: .7 }}>
                        {context.category} ▷ {context.subcategory} ▷ {context.symptom} (Pre-KTAS: {context.ktasCode})
                    </span>
                </div>
            </div>
            <button className="bottom" onClick={() => complete()}>이송 완료</button>
        </main>
    )
}