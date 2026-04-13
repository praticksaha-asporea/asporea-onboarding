"use client";

import React, { useState } from "react";

const TACDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const candidates = [
    {
      name: "Alina Smith",
      id: "ASP-INQ-2154",
      stage: "Inquired",
      token: "Yes",
      status: "Waiting For Pre-Counselling",
      time: "2 hours ago",
    },
    {
      name: "John Smith",
      id: "ASP-INQ-2154",
      stage: "Inquired",
      token: "No",
      status: "Pre-Counselling Scheduled",
      time: "1 day ago",
    },
    {
      name: "David Jackson",
      id: "ASP-INQ-2154",
      stage: "Inquired",
      token: "No",
      status: "Counselled",
      time: "3 days ago",
    },
    {
      name: "Brian Taylor",
      id: "ASP-INQ-2154",                                 
      stage: "Document Upload",
      token: "No",
      status: "Counselled",
      time: "5 days ago",
    },
    {
      name: "Jacob Martinez",
      id: "ASP-INQ-2154",
      stage: "Experience",
      token: "No",
      status: "Counselled",
      time: "1 week ago",
    },
    {
      name: "Anthony Moore",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "Yes",
      status: "Waiting For Assessment",
      time: "2 days ago",
    },
    {
      name: "Ryan White",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "No",
      status: "Waiting For Assessment",
      time: "6 hours ago",
    },
    {
      name: "Joseph Anderson",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "No",
      status: "Document Verified",
      time: "2 days ago",
    },
    {
      name: "Elizabeth Hall",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "Yes",
      status: "Experience Verified",
      time: "2 days ago",
    },
    {
      name: "Ashley Thomas",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "Yes",
      status: "Assessed",
      time: "2 days ago",
    },
    {
      name: "Charles Morris",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "Yes",
      status: "Technical Round",
      time: "2 days ago",
    },
    {
      name: "Jacob Martinez",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "No",
      status: "Documents Rejected",
      time: "2 days ago",
    },
    {
      name: "Joseph Anderson",
      id: "ASP-INQ-2154",
      stage: "Assessment",
      token: "Yes",
      status: "Document Verified",
      time: "2 days ago",
    },
  ];

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case "Waiting For Pre-Counselling":
        return "bg-blue-100 text-blue-600";
      case "Pre-Counselling Scheduled":
        return "bg-blue-200 text-blue-700";
      case "Counselled":
        return "bg-green-500 text-white";
      case "Waiting For Assessment":
        return "bg-blue-100 text-blue-600";
      case "Document Verified":
        return "bg-green-500 text-white";
      case "Experience Verified":
        return "bg-orange-400 text-white";
      case "Assessed":
        return "bg-green-500 text-white";
      case "Technical Round":
        return "bg-gray-800 text-white";
      case "Documents Rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-6 md:p-8 font-sans text-gray-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 className="text-[28px] font-medium text-gray-800 tracking-tight">
          TAC Assignment Dashboard
        </h1>

        {/* Notification Alert Card */}
        {/* <div className="flex items-center gap-4 p-3 bg-white  border-gray-100 rounded-xl  min-w-[300px]">
          <img src="/images/pages/logopic.png" alt="" />
          <div>
            <p className="text-[14px] font-medium text-gray-900 leading-tight mb-1">
              Scheduled Pre-Counselling
            </p>
            <p className="text-[11px] text-gray-500 leading-snug">
              You have been assigned for Inquiry
              ASP-EINQ-XXXX, Please Check
            </p>
          </div>
        </div> */}
      </div>

      {/* KPI SECTION */}
      <h2 className="text-[19px] font-semibold text-gray-900 mb-3 ">
        Key Performance Indicators
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Card 1 */}
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold text-gray-600">
              Open Cases
            </span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-[36px] font-bold text-gray-900 leading-none mb-2">
            7
          </h3>
          <p className="text-[12px] text-gray-500">
            Candidates actively managed
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[12px] font-semibold text-gray-600">
              Pending Pre-Counselling
            </span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <h3 className="text-[36px] font-bold text-gray-900 leading-none mb-2">
            4
          </h3>
          <p className="text-[10px] -translate-y-2 text-gray-500">
            Currently undergoing pre-counselling
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-semibold text-gray-600">
              Pending Assessments
            </span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-[36px] font-bold text-gray-900 leading-none mb-2">
            3
          </h3>
          <p className="text-[11px] text-gray-500">
            Documents or experience checks
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-medium text-gray-600">
              Upcoming Counselling
            </span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-[36px] font-bold text-gray-900 leading-none mb-2">
            1
          </h3>
          <p className="text-[11px] text-gray-500">
            Scheduled sessions this week
          </p>
        </div>
      </div>

      {/* ASSIGNED CANDIDATES TABLE SECTION */}
      <h2 className="text-[19px] font-medium text-gray-900 mb-5">
        Assigned Candidates
      </h2>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="w-full md:w-[400px]">
          <input
            type="text"
            placeholder="Search candidate by name/ inquiry id..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-[14px] outline-none focus:border-blue-400 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <select className="w-full md:w-auto border border-gray-200 text-gray-700 text-[14px] rounded-lg pl-4 pr-10 py-2.5 outline-none appearance-none bg-white cursor-pointer hover:bg-gray-50">
              <option>Filter by Stage</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <div className="relative w-full md:w-auto">
            <select className="w-full md:w-auto border border-gray-200 text-gray-700 text-[14px] rounded-lg pl-4 pr-10 py-2.5 outline-none appearance-none bg-white cursor-pointer hover:bg-gray-50">
              <option>Filter by Experience</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full border-t border-gray-200 pt-2">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-gray-500 text-[13px] font-semibold">
              <th className="py-4 px-4 font-semibold border-b border-gray-200">
                Candidate Name
              </th>
              <th className="py-4 px-4 font-semibold border-b border-gray-200">
                Application Stage
              </th>
              <th className="py-4 px-4 font-semibold border-b border-gray-200">
                Token
              </th>
              <th className="py-4 px-4 font-semibold border-b border-gray-200 text-center">
                Status
              </th>
              <th className="py-4 px-4 font-semibold border-b border-gray-200">
                Last Activity
              </th>
              <th className="py-4 px-4 font-semibold border-b border-gray-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {filteredCandidates.map((candidate, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="font-medium text-[12px] text-gray-900">{candidate.name}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {candidate.id}
                  </p>
                </td>
                <td className="py-3 px-4 text-gray-600">{candidate.stage}</td>
                <td className="py-3 px-4 text-gray-600">{candidate.token}</td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${getBadgeStyle(candidate.status)}`}
                  >
                    {candidate.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 text-[14px]">
                  {candidate.time}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end items-center gap-4 text-gray-400">
                    <button className="hover:text-gray-700 bg-transparent transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                        />
                      </svg>
                    </button>
                    <button className="hover:text-gray-700 bg-transparent transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    </button>
                    <button className="hover:text-gray-700 bg-transparent transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TACDashboard;
