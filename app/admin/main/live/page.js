"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import Papa from 'papaparse';
import { useRouter } from "next/navigation";


const Page = () => {

  const router = useRouter();
  async function auth() {
    const fetch_api = await fetch("/api/auth/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await fetch_api.json();
    if (!data.success) {
      router.push("/login");
    }
  };


  const [Cards, setCards] = useState([]);
  const [Attendance, setAttendance] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [Loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const searchQueryLowercase = searchQuery.toLowerCase();
  const [processedAttendance, setProcessedAttendance] = useState([]);


  // Filter cards based on the case-insensitive search query
  const filteredCards = processedAttendance.filter(
    (card) =>
      card.name.toLowerCase().includes(searchQueryLowercase) ||
      card.class.toLowerCase().includes(searchQueryLowercase) ||
      new Date(card.login).toLocaleDateString().toLowerCase().includes(searchQueryLowercase) ||
      card.contact.toLowerCase().includes(searchQueryLowercase)
  );

  useEffect(() => {
    auth()
    fetchUsers();
    fetchAttendance();
  }, []);

  // Format the date as needed
  function fetchAttendance() {
    setLoading(true);
    fetch("/api/getAttendance")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setAttendance(data.allAttendanceLogs)
        } else {
          console.error("API request failed");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }


  function fetchUsers() {
    fetch("/api/getCard")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCards(data.cards)
        } else {
          console.error("API request failed");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  const processAttendance = () => {
    const today = new Date();
    const processedData = Attendance.map(entry => {
      // Find corresponding card details
      const cardDetails = Cards.find(card => card.cardID === entry.cardID);
      // If cardDetails is found and login date is today, construct the desired object
      if (cardDetails && new Date(entry.Login).toLocaleDateString() === today.toLocaleDateString()) {
        return {
          cardID: entry.cardID,
          name: cardDetails.name,
          class: cardDetails.class,
          contact: cardDetails.contact,
          login: entry.Login,
          logout: entry.Logout
        };
      }
      // If cardDetails is not found or login date is not today, return null
      return null;
    }).filter(entry => entry !== null); // Filter out null entries
    // Update state with processed data
    setProcessedAttendance(processedData);
  };


  useEffect(() => {
    processAttendance();
    setLoading(false);
  }, [Attendance, Cards]);



  function isValidDate(dateString) {
    const dateObject = new Date(dateString);
    return !isNaN(dateObject.getTime());
  }


  const exportToCSV = (data) => {
    const filteredData = data.map(({ __v, _id, ...rest }) => rest);

    // Convert the filtered data to CSV
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'order-report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Your browser does not support downloading files.');
    }
  };

  function report() {
    exportToCSV(Cards);
  }



  const [printData, setPrintData] = useState({
    title: 'Printable Title',
    description: 'This is the content to be printed.',
  });

  const handlePrint = () => {
    const printableArea = document.getElementById('printableArea');

    if (printableArea) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Print</title> <script src="https://cdn.tailwindcss.com"></script></head><body>');
      printWindow.document.write('<div class="flex justify-center items-center mt-3"><button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onclick="window.print()">Print</button></div>');
      printWindow.document.write('<div style="margin: 20px;">');
      printWindow.document.write(printableArea.innerHTML);
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
    }
  };


  return (
    <>
      <div class="p-4 sm:ml-64">
        <div class=" mt-14">
          <form>
            <label
              for="default-search"
              class="mb-2 text-sm font-medium text-gray-900 sr-only"
            >
              Search
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  class="w-4 h-4 text-gray-500 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />

                </svg>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                id="default-search"
                class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Search Mockups, Logos..."
                required
              />
              <button
                type="submit"
                class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Search
              </button>
            </div>
          </form>
          <div className="flex justify-between my-3 px-5 items-center" >
            <p className="text-xl font-bold">Today : Live Attendance</p>

            <div>

              <button onClick={handlePrint} type="button" class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800">Export Pdf</button>
              <button onClick={report} type="button" class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800">Export CSV</button>
             
              <button
                class=" text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-md px-5 py-2 text-center"
                type="button"
                onClick={() => fetchAttendance()}
              >
                Refresh
              </button>
            </div>

          </div>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg h-screen" id="printableArea">

          {Loading ? (<div role="status" className="flex justify-center">
            <svg
              aria-hidden="true"
              class="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span class="sr-only">Loading...</span>
          </div>) : ""}


          {filteredCards.length > 0 ? (
            <table className="w-full mt-3 text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Card ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Class
                  </th>{" "}
                  <th scope="col" className="px-6 py-3">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Meal
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Login
                  </th>{" "}
                  <th scope="col" className="px-6 py-3">
                    Logout
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.cardID} className="bg-white border-b">
                    {/* Display only the relevant columns */}
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {card.cardID}
                    </th>
                    <td className="px-6 py-4">{card.name}</td>
                    <td className="px-6 py-4">{card.class}</td>
                    <td className="px-6 py-4">{card.contact}</td>
                    <td className="px-6 py-4">
                      {new Date(card.login).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
  {(() => {
    const hours = new Date(card.login).getHours(); // Get the hour of the day
    if (hours >= 6 && hours < 11) {
      return 'Breakfast'; // Between 6:00 AM and 10:59 AM
    } else if (hours >= 11 && hours < 16) {
      return 'Lunch'; // Between 11:00 AM and 3:59 PM
    } else if (hours >= 16 && hours < 21) {
      return 'Dinner'; // Between 4:00 PM and 8:59 PM
    } else {
      return 'Late Night'; // For hours between 9:00 PM and 5:59 AM
    }
  })()}
</td>


<td className="px-6 py-4">
                      {new Date(card.login).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      {isValidDate(card.logout)
                        ? new Date(card.logout).toLocaleTimeString()
                        : "Pending"}
                    </td>





                    <td className="px-6 py-4">
                      <a
                        href={`/admin/main/edit?id=${card.cardID}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-lg mt-4 text-center">
              No matching records found.
            </p>
          )}
        </div>
      </div>

      <div
        id="authentication-modal"
        tabindex="-1"
        aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div class="relative p-4 w-full max-w-md max-h-full">
          <div class="relative bg-white rounded-lg shadow">
            <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
              <h3 class="text-xl font-semibold text-gray-900">
                Sign in to our platform
              </h3>
              <button
                type="button"
                class="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
                data-modal-hide="authentication-modal"
              >
                <svg
                  class="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span class="sr-only">Close modal</span>
              </button>
            </div>

            <div class="p-4 md:p-5">
              <form class="space-y-4" action="#">
                <div>
                  <label
                    for="email"
                    class="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div>
                  <label
                    for="password"
                    class="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Your password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div class="flex justify-between">
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input
                        id="remember"
                        type="checkbox"
                        value=""
                        class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                        required
                      />
                    </div>
                    <label
                      for="remember"
                      class="ms-2 text-sm font-medium text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>
                  <a href="#" class="text-sm text-blue-700 hover:underline">
                    Lost Password?
                  </a>
                </div>
                <button
                  type="submit"
                  class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                  Login to your account
                </button>
                <div class="text-sm font-medium text-gray-500 ">
                  Not registered?{" "}
                  <a href="#" class="text-blue-700 hover:underline">
                    Create account
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
