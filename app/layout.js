import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Smart Mess Attendance",
  description: "Mess Attendance",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <Navbar/>   
         {children} 
        <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.js" defer  />
      </body>
    </html>
  );
}
