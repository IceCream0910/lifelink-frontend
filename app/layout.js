import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "LifeLink - 응급환자 이송 병원 탐색 솔루션",
  description: "응급환자 이송 병원 탐색 솔루션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
