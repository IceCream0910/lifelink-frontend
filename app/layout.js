import "./globals.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "LifeLink - 응급환자 이송 병원 탐색 솔루션",
  description: "응급환자 이송 병원 탐색 솔루션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script
          type="text/javascript"
          src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=290387249084e11854eeb81fc523681e&libraries=services"
        ></script>
      </head>
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
