"use client";
import dynamic from 'next/dynamic';

const DynamicHome = dynamic(() => import('./funnelWrapper'), { ssr: false });

export default function Home() {
  return <DynamicHome />;
}