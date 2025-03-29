import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Under from "@/components/Under";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BharatGen Smart Attendance",
  description: "Smart Attendance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        // <Navbar/>
        {/* <Under/> */}
        // {children}
    <p>UNDER MAINTENANCE</p>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js" defer  />
      </body>
    </html>
  );
}
