"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [USER, setUSER] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine meal type based on login time
  const getMealType = (loginTime) => {
    const hour = new Date(loginTime).getHours();
    if (hour >= 5 && hour < 10) return "Breakfast";
    if (hour >= 10 && hour < 15) return "Lunch";
    if (hour >= 15 && hour < 18) return "Snack";
    if (hour >= 18 && hour < 22) return "Dinner";
    return "Late Night";
  };

  // Authenticate user
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch("/api/parentauth/");
        const data = await response.json();
        if (data.success && data.user) {
          setUSER(data.user); // Set user once
        } else {
          router.push("/parents/login");
        }
      } catch (error) {
        console.error("Authentication failed", error);
        router.push("/parents/login");
      }
    };

    authenticateUser();
  }, []); // Runs only once when the component mounts

  // Fetch attendance data only when USER is available
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!USER) return; // Prevent fetching if USER is not set

        const response = await fetch("/api/getAttendance");
        const data = await response.json();
        if (data.success) {
          const userAttendance = data.allAttendanceLogs.filter(
            (entry) => entry.cardID === USER.cardID
          ).map((record) => ({
            ...record,
            mealType: getMealType(record.Login) // Add meal type
          }));
          setAttendanceRecords(userAttendance);
        }
      } catch (error) {
        console.error("Error fetching attendance data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [USER]); // Runs only when USER is updated

  return (
    <div className="p-4 sm:ml-64">
      <Navbar />
      <div className="mt-14">
        {USER && <h2 className="text-2xl font-bold mb-4">Hi, {USER.name} 👋</h2>}
        <h2 className="text-xl font-bold mb-4">Your Meal Attendance</h2>
        {loading ? (
          <div className="flex justify-center">Loading...</div>
        ) : attendanceRecords.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attendanceRecords.map((record, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-md bg-white">
                <p><strong>Card ID:</strong> {record.cardID}</p>
                <p><strong>Login:</strong> {new Date(record.Login).toLocaleString()}</p>
                <p><strong>Logout:</strong> {new Date(record.Logout).toLocaleString()}</p>
                <p><strong>Meal Type:</strong> {record.mealType}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No attendance records found.</p>
        )}
      </div>
    </div>
  );
};

export default Page;