"use client";

import React, { useState } from "react";

const TACDashboard = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);  
  const [currentView, setCurrentView] = useState<
    "dashboard" | "detail" | "assessment"
  >("dashboard");

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
      id: "ASP-INQ-2155",
      stage: "Inquired",
      token: "No",
      status: "Pre-Counselling Scheduled",
      time: "1 day ago",
    },
    {
      name: "David Jackson",
      id: "ASP-INQ-2156",
      stage: "Inquired",
      token: "No",
      status: "Counselled",
      time: "3 days ago",
    },
    {
      name: "Brian Taylor",
      id: "ASP-INQ-2157",
      stage: "Document Upload",
      token: "No",
      status: "Counselled",
      time: "5 days ago",
    },
    {
      name: "Jacob Martinez",
      id: "ASP-INQ-2158",
      stage: "Experience",
      token: "No",
      status: "Counselled",
      time: "1 week ago",
    },
    {
      name: "Anthony Moore",
      id: "ASP-INQ-2159",
      stage: "Assessment",
      token: "Yes",
      status: "Waiting For Assessment",
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

  const scoringSections = [
    {
      id: 1,
      title: "ACADEMIC QUALIFICATION",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label: "Post Graduate Certificate / Diploma / Master Degree",
          score: 10,
          selected: true,
        },
        {
          label: "3 Years Honours Undergraduate Degree / 4 Years Degree",
          score: 7,
        },
        { label: "3 Years Undergraduate Degree", score: 6 },
        { label: "Higher / Senior Secondary Education", score: 5 },
        { label: "Secondary School Education", score: 3 },
      ],
    },
    {
      id: 2,
      title: "PROFESSIONAL QUALIFICATION",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Professional Certification / L7 (Recognized)", score: 10 },
        {
          label: "3 Years Diploma Course / L6 (Recognized)",
          score: 9,
          selected: true,
        },
        { label: "2 Years Diploma Course / L4/L5 (Recognized)", score: 7 },
        { label: "ITI  /Trade Certificate / L1/L2 [Recognized]", score: 4 },
        {
          label: "Certificate Course / Skill Development (Recognized)",
          score: 2,
        },
      ],
    },
    // ID 3 is Language Abilities, handled explicitly in JSX for the complex UI
    {
      id: 4,
      title: "GENERAL ABILITIES",
      max: 7,
      bg: "bg-[#f5f5dc]",
      text: "text-yellow-900",
      options: [
        { label: "Communication Skills", score: 4, selected: true },
        { label: "Personality & Confidence", score: 3 },
      ],
    },
    {
      id: 5,
      title: "WORK EXPERIENCE (RELEVANT)",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Six years or more", score: 10 },
        { label: "Four to Five years", score: 7, selected: true },
        { label: "Two to Three years", score: 5 },
        { label: "One year", score: 3 },
      ],
    },
    {
      id: 6,
      title: "ABROAD WORK EXPERIENCE",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Six years or more", score: 10 },
        { label: "Two to Three years", score: 5, selected: true },
        { label: "One year", score: 3 },
      ],
    },
    {
      id: 7,
      title: "STABILITY (DURATION AT SINGLE EMPLOYER)",
      max: 5,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "Has worked in one employer for more than 5 years", score: 5 },
        {
          label: "Has worked in one employer for 2 to 5 years",
          score: 4,
          selected: true,
        },
        { label: "Has worked in one employer for 2 years", score: 3 },
      ],
    },
    {
      id: 8,
      title: "CAREER INITIATIVE",
      max: 5,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label: "Changed employment in same industry in last three employment",
          score: 4,
          selected: true,
        },
        {
          label: "Changed employment in same industry in last two employment",
          score: 3,
        },
      ],
    },
    {
      id: 9,
      title: "AGE BRACKET",
      max: 10,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        { label: "18 to 25 years", score: 10 },
        { label: "26 to 30 years", score: 7, selected: true },
        { label: "31 to 35 years", score: 5 },
        { label: "More than 36 years", score: 1 },
      ],
    },
    {
      id: 10,
      title: "EXISTING PROFESSIONAL LICENSE",
      max: 8,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label:
            "Has obtained any License to the profession from India / Foreign",
          score: 3.5,
        },
        {
          label: "Has obtained Driving License from Foreign Country",
          score: 2.5,
          selected: true,
        },
      ],
    },
    {
      id: 11,
      title: "ADAPTABILITY & MOBILITY",
      max: 6,
      bg: "bg-[#f3e8ff]",
      text: "text-purple-900",
      options: [
        {
          label:
            "Applicant has a minimum of 1 year skilled Work experience in Abroad",
          score: 2,
          selected: true,
        },
        {
          label: "Applicant spouse is working in Abroad",
          score: 1,
          selected: true,
        },
        { label: "Applicant family member is working in Abroad", score: 1 },
      ],
    },
  ];

   

   

  if (currentView === "detail" && selectedCandidate) {
    return (
      <div className="w-full min-h-screen bg-gray-50/30 p-4 md:p-6 font-sans text-gray-900">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => {
              setSelectedCandidate(null);
              setCurrentView("dashboard");
            }}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-[22px] font-bold text-gray-900">
            Candidate Details
          </h1>
        </div>

        {/* MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: MAIN FORMS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* SECTION 1: INQUIRY DETAILS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
              <h2 className="text-[18px] font-medium text-gray-900 mb-5">
                Inquiry Details ( ASP-EINQ-XXXX )
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCandidate.name}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="alina.smith@example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Passport Status
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400 bg-white">
                    <option>Having</option>
                    <option>Not Having</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Passport No
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Full Address *
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="15, Bengali Street, 
                     Ward 15,&#13;&#10;Siliguri - 734001,&#13;&#10;Darjeeling District, West Bengal"
                    className="w-full border border-gray-300 rounded-md px-2 py-6  text-[13px] outline-none focus:border-blue-400 resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-gray-600 mb-1.5 block">
                    Status
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-[12px] outline-none focus:border-blue-400 bg-white">
                    <option>Waiting For Pre-Counselling</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="bg-[#93c5fd] hover:bg-blue-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
                  Update
                </button>
              </div>
            </div>

            {/* SECTION 2: PRE-COUNSELLING */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5">
              <h2 className="text-[22px] font-bold text-gray-700 mb-5 -mt-3 tracking-wide text-center">
                Pre-Counseling
              </h2>

              <div className="flex flex-col gap-5">
                {/* Status */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 mb-2 block">
                    Status
                  </label>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="preStatus"
                        defaultChecked
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[13px] text-gray-600 font-medium">
                        Not Scheduled
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="preStatus"
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[13px] text-gray-400 font-medium">
                        In Progress
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="preStatus"
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[13px] text-gray-400 font-medium">
                        Finished
                      </span>
                    </label>
                  </div>
                </div>

                {/* Visit Opinion & Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-2 block">
                      Visit Opinion
                    </label>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="visit"
                          defaultChecked
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          In-Office
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="visit"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-400 font-medium">
                          Remote
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Branch
                    </label>
                    <select
                      disabled
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-blue-400"
                    >
                      <option>Siliguri</option>
                    </select>
                  </div>
                </div>

                {/* Hear From & Referred By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Hear From
                    </label>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-blue-400">
                      <option>PCRA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Referred By
                    </label>
                    <select
                      disabled
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-blue-400"
                    >
                      <option>PCRA</option>
                    </select>
                  </div>
                </div>

                {/* Token */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Token No
                    </label>
                    <input
                      type="text"
                      defaultValue="T001"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Token Generated
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="25/02/2026 11:16 AM"
                        className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:border-blue-400"
                      />
                      <svg
                        className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-2">
                  <button className="bg-[#93c5fd] text-white text-[13px] font-medium px-5 py-2 rounded-lg cursor-not-allowed">
                    Call for Pre-Counselling
                  </button>
                  <button className="bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-semibold px-5 py-2 rounded-lg transition-colors">
                    Queue for Pre-Counselling
                  </button>
                </div>

                {/* Textareas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <div>
                    <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                      Additional Details of Candidate{" "}
                      <span className="text-red-700">*</span>
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Worked in sales from 2-3 years, etc..."
                      className="w-full border border-gray-200 text-gray-500 rounded-md px-3 py-2 text-[14px] outline-none font-sans focus:border-blue-400 resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                      Specific Notes (During Pre-Counselling)
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="Not wants to work in Europe"
                      className="w-full border border-gray-200 text-gray-500 rounded-md px-3 py-2 text-[14px] font-sans outline-none focus:border-blue-400 resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                      Advice
                    </label>
                    <textarea
                      rows={3}
                      defaultValue="German Nurse Opportunity and details shared with candidate"
                      className="w-full border border-gray-200 text-gray-500 rounded-md px-3 py-2 text-[13px] font-sans outline-none focus:border-blue-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <span className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                    Resume
                  </span>

                  <label className="w-full md:w-1/2 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
                    {/* Hidden File Input with onChange */}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf, .jpg, .jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                    />

                    {resumeFile ? (
                      <div className="flex flex-col items-center text-center">
                        {/* Success Check Icon */}
                        <svg
                          className="w-8 h-8 text-green-500 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-[13px] font-bold text-gray-800 mb-1">
                          {resumeFile.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        {/* Default Upload Icon */}
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-[13px] font-medium text-gray-600 mb-1">
                          Drop files here or click to browse
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Supported format: PDF, JPG
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-6">
                  <button className="bg-[#fca5a5] hover:bg-red-400 text-gray-100 text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
                    Not Responded
                  </button>
                  <button className="bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
                    Send As Prescription
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: ASSESSMENT */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
              <h2 className="text-[28px] font-medium text-gray-900 mb-5 text-center">
                Assessment
              </h2>

              <div className="flex flex-col gap-5">
                {/* Top Status similar to Pre-Counselling */}
                <div>
                  <label className="text-[14px] font-semibold text-gray-700 mb-2 block">
                    Status
                  </label>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assStatus"
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[12px] text-gray-400 font-sans">
                        Not Scheduled
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assStatus"
                        defaultChecked
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[12px] text-gray-600 font-sans">
                        In Progress
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assStatus"
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[13px] text-gray-400 font-sans">
                        Finished
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="assStatus"
                        className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                      />
                      <span className="text-[13px] text-gray-400 font-sans">
                        Requested
                      </span>
                    </label>
                  </div>
                </div>

                {/* Visit Opinion & Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-2 block">
                      Visit Opinion
                    </label>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assVisit"
                          defaultChecked
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          In-Office
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assVisit"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-400 font-medium">
                          Remote
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                      Branch
                    </label>
                    <select
                      disabled
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:border-blue-400"
                    >
                      <option>Siliguri</option>
                    </select>
                  </div>
                </div>

                {/* Token */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                      Token No
                    </label>
                    <input
                      type="text"
                      defaultValue="T001"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 mb-1.5 block">
                      Token Generated
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="25/02/2026 11:16 AM"
                        className="w-full border border-gray-300 mt-0 rounded-md pl-9 pr-3 py-2 text-[13px] tracking-wider outline-none focus:border-blue-400"
                      />
                      <svg
                        className="w-4 h-4 text-gray-400  absolute left-3 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Assessment Actions */}
                <div className="flex justify-center md:justify-end gap-3 mt-2 mb-4">
                  <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-5 py-2 rounded-lg cursor-not-allowed">
                    Call for Assessment
                  </button>
                  <button className="bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-bold px-5 py-2 rounded-lg transition-colors">
                    Queue for Assessment
                  </button>
                </div>

                {/* --------------------------------- */}
                {/* SUB-SECTION: DOCUMENTS */}
                <div className="border border-gray-200 rounded-xl p-5 mb-2">
                  <div className="mb-5">
                    <p className="text-[13px] font-bold text-gray-800 mb-2">
                      Documents
                    </p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="jobRole"
                          className="w-3.5 h-3.5 accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 tracking-wider font-medium">
                          Uploaded
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="jobRole"
                          className="w-3.5 h-3.5  accent-blue-600"
                        />
                        <span className="text-[13px] tracking-wider text-gray-600 font-medium">
                          Verified
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-[13px] tracking-wide font-bold text-gray-800 mb-2">
                      Applied Job Role
                    </p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="jobRole"
                          className="w-3.5 h-3.5 accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          Nurse
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="jobRole"
                          className="w-3.5 h-3.5 accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          Caregiver
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-6 py-2 rounded-lg">
                      Resume
                    </button>
                    <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-6 py-2 rounded-lg">
                      Documents
                    </button>
                    <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-6 py-2 rounded-lg">
                      Experience
                    </button>
                    <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-6 py-2 rounded-lg">
                      Academic
                    </button>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="bg-[#fca5a5] hover:bg-red-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
                      Rejected
                    </button>
                    <button className="bg-[#86efac] hover:bg-green-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors">
                      Verified
                    </button>
                  </div>
                </div>

                {/* SUB-SECTION: EXPERIENCE */}
                <div className="border border-gray-200 rounded-xl p-5 mb-2">
                  <div className="mb-4">
                    <p className="text-[12px] font-semibold text-gray-700 mb-2 block">
                      Experience
                    </p>
                    <div className="flex items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="expState"
                          defaultChecked
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          Selected
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="expState"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-400 font-medium">
                          Verified
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-5 md:w-1/2">
                    <label className="text-[12px] font-semibold text-gray-400 mb-1.5 block">
                      Experience Choosen
                    </label>
                    <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-500 bg-white outline-none focus:border-blue-400">
                      <option>Domestic</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="bg-[#fde047] hover:bg-yellow-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                      TL Verified
                    </button>
                    <button className="bg-[#86efac] hover:bg-green-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                      Save
                    </button>
                  </div>
                </div>

                {/* SUB-SECTION: ASSESSMENT FLOW */}
                <div className="border border-gray-200 rounded-xl p-5 mb-2">
                  <div className="mb-6">
                    <p className="text-[12px] font-semibold text-gray-700 mb-2 block">
                      Assessment
                    </p>
                    <div className="flex flex-wrap items-center gap-5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assFlow"
                          defaultChecked
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-600 font-medium">
                          Requested
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assFlow"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-500 font-medium">
                          Queued
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assFlow"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-500 font-medium">
                          Taking
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="assFlow"
                          className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                        />
                        <span className="text-[13px] text-gray-500 font-medium">
                          Finished
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button className="bg-[#fca5a5] hover:bg-red-400 text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors">
                      Refer Technical
                    </button>
                    <button
                      onClick={() => setCurrentView("assessment")}
                      className="bg-[#fde047] hover:bg-yellow-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Start
                    </button>
                    <button className="bg-[#86efac] hover:bg-green-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                      Save
                    </button>
                  </div>
                </div>

                {/* --------------------------------- */}
                {/* SUB-SECTION: TECHNICAL ROUND */}
                <div className="border border-gray-200 rounded-xl p-5">
                  {/* --------------------------------- */}
                  {/* SUB-SECTION: TECHNICAL ROUND */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    {/* Technical Round Radio */}
                    <div className="mb-4">
                      <p className="text-[12px] font-semibold text-gray-700 mb-2 block">
                        Technical Round
                      </p>
                      <div className="flex items-center gap-5">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="techRound"
                            className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                          />
                          <span className="text-[13px] text-gray-400 font-medium">
                            Referred
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="techRound"
                            className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                          />
                          <span className="text-[13px] text-gray-400 font-medium">
                            In Progress
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="techRound"
                            defaultChecked
                            className="w-3.5 h-3.5 cursor-pointer !accent-blue-600"
                          />
                          <span className="text-[13px] text-gray-600 font-medium">
                            Finished
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Dropdown & Button */}
                    <div className="mb-5 md:w-1/2">
                      <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">
                        Classify Experience
                      </label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-600 bg-white outline-none focus:border-blue-400 cursor-pointer">
                        <option>Domestic</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button className="bg-[#86efac] hover:bg-green-400 text-white text-[13px] font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PROGRESS CARD */}
          <div className="lg:col-span-4  ">
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-5 sticky top-6">
              <h2 className="text-[16px] font-semibold text-gray-900 mb-4">
                Progress
              </h2>

              <div className="mb-4">
                <label className="text-[12px] font-semibold text-gray-700 mb-2  block">
                  Escalate to Another TAC
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-[12px] text-gray-600 bg-white outline-none focus:border-blue-400">
                  <option>-- Talent Acquisition Consultant --</option>
                </select>
              </div>

              <p className="text-[10px] font-semibold text-red-500 mb-5">
                NOTE: This will need approval of your manager.
              </p>

              <div className="flex justify-center">
                <button className="bg-[#93c5fd] text-white text-[13px] font-bold px-8 py-2 rounded-lg cursor-not-allowed">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "assessment") {
    return (
      <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-900">
        {/* Back Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentView("detail")}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              strokeWidth="2"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-[22px] font-bold text-gray-900">
            Assessment Form
          </h1>
        </div>

        <div className="w-full bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-200 p-6 md:p-8">
          {/* TOP INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div>
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mb-1.5 uppercase tracking-wide">
                Name of Candidate
              </label>
              <input
                type="text"
                defaultValue={selectedCandidate?.name || "Jonathan Doe"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mb-1.5 uppercase tracking-wide">
                Passport No.
              </label>
              <input
                type="text"
                defaultValue="H234566Y"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mb-1.5 uppercase tracking-wide">
                Date of Assessment
              </label>
              <input
                type="text"
                defaultValue="11/11/2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mb-1.5 uppercase tracking-wide">
                Assessment No.
              </label>
              <input
                type="text"
                defaultValue="ASF-2015-1021"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-500 flex items-center gap-2 mb-1.5 uppercase tracking-wide">
                Assessed By
              </label>
              <input
                type="text"
                defaultValue="Mason Lee"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-800 font-medium outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mb-10">
            {/* Table Header */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="flex gap-4 w-full">
                <span className="w-8">S.N</span>
                <span className="flex-1">Factor / Criteria</span>
              </div>
              <div className="flex gap-10 min-w-[120px] justify-end">
                <span>Score</span>
                <span>Final</span>
              </div>
            </div>

            {scoringSections.map((section) => {
              const isLanguagePos = section.id === 4;

              return (
                <React.Fragment key={section.id}>
                  {isLanguagePos && (
                    <>
                      <div className="flex items-center justify-between bg-[#ffedd5] px-4 py-2.5 font-bold text-[13px] border-b border-gray-200">
                        <div className="flex gap-4 w-full items-center text-orange-900">
                          <span className="w-8">3</span>
                          <span className="flex-1 flex items-center gap-2 uppercase">
                            LANGUAGE ABILITIES (2ND & 3RD LANGUAGES){" "}
                            <svg
                              className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex gap-10 min-w-[120px] justify-end pr-2">
                          <span className="text-gray-500 font-medium text-[11px]">
                            Max.
                          </span>
                          <span className="w-6 text-center text-gray-900">
                            20
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-1.5 bg-gray-50 border-b -translate-x-8 border-gray-200">
                        <span className="pl-8 text-[10px]  font-bold text-orange-400 uppercase tracking-wider">
                          2nd Language (English)
                        </span>
                      </div>
                      {["Listening", "Speaking", "Writing", "Reading"].map(
                        (skill, i) => (
                          <div
                            key={`eng-${i}`}
                            className={`px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors`}
                          >
                            <span className="pl-12 text-[13px] text-gray-700 w-[200px]">
                              {skill}
                            </span>
                            <div className="flex gap-2 flex-1 justify-end pr-10">
                              {["L1", "L2", "L3", "L4"].map((lvl, j) => {
                                const isSelected =
                                  (skill === "Writing" && j === 2) ||
                                  (skill !== "Writing" && j === 3);
                                return (
                                  <button
                                    key={j}
                                    className={`w-8 h-7 rounded text-[11px] font-bold transition-colors ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border border-gray-200 text-gray-400 bg-white hover:border-blue-400"}`}
                                  >
                                    {lvl}
                                  </button>
                                );
                              })}
                            </div>
                            <span className="mr-3 text-[13px] font-bold text-gray-900 w-6 text-center">
                              {skill === "Writing" ? "3" : "4"}
                            </span>
                          </div>
                        ),
                      )}

                      <div className="px-4 py-1.5 bg-gray-50 border-b -translate-x-8 border-gray-200">
                        <span className="pl-8 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                          3rd Language (Arabic / German / Japanese)
                        </span>
                      </div>
                      {["Listening", "Speaking", "Writing", "Reading"].map(
                        (skill, i) => (
                          <div
                            key={`oth-${i}`}
                            className={`px-4 py-2 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors`}
                          >
                            <span className="pl-12 text-[13px] text-gray-700 w-[200px]">
                              {skill}
                            </span>
                            <div className="flex gap-2 flex-1 justify-end pr-10">
                              {["L1", "L2", "L3", "L4"].map((lvl, j) => (
                                <button
                                  key={j}
                                  className={`w-8 h-7 rounded text-[11px] font-bold transition-colors ${j === 0 ? "bg-blue-600 text-white border-blue-600" : "border border-gray-200 text-gray-400 bg-white hover:border-blue-400"}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                            <span className="mr-3 text-[13px] font-bold text-gray-900 w-6 text-center">
                              1
                            </span>
                          </div>
                        ),
                      )}
                    </>
                  )}

                  <div
                    className={`flex items-center justify-between ${section.bg} px-4 py-2.5 font-bold text-[13px] border-b border-gray-200`}
                  >
                    <div
                      className={`flex gap-4 w-full items-center ${section.text}`}
                    >
                      <span className="w-8">{section.id}</span>
                      <span className="flex-1 flex items-center gap-2 uppercase">
                        {section.title}{" "}
                        <svg
                          className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </span>
                    </div>
                    <div className="flex gap-10 min-w-[120px] justify-end pr-2">
                      <span className="text-gray-500 font-medium text-[11px]">
                        Max.
                      </span>
                      <span className="w-6 text-center text-gray-900">
                        {section.options.find((o) => o.selected)?.score || "-"}
                      </span>
                    </div>
                  </div>

                  {section.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`px-4 py-2 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors ${opt.selected ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-center pl-10">
                        {opt.selected  }
                        <span
                          className={`text-[13px] ${opt.selected ? "text-gray-900 font-medium" : "text-gray-900"}`}
                        >
                          {opt.label}
                        </span>
                      </div>
                      <span
                        className={`mr-3 text-[13px] ${opt.selected ? "font-bold text-gray-900" : "font-medium text-gray-500"}`}
                      >
                        {opt.score}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}

            <div className="bg-[#eff6ff] px-4 py-5 border-t border-gray-300 flex justify-end items-center gap-6">
              <span className="text-[14px] font-extrabold text-gray-900 uppercase tracking-widest">
                Grand Total Score:
              </span>
              <span className="text-[18px] font-extrabold text-blue-600 mr-2">
                78 / 100
              </span>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Additional Assessment Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Note 1: Academic & Professional Details
                </label>
                <textarea
                  rows={4}
                  defaultValue="Candidate possesses a Master's from a top-tier European University. Specialized certification in Lean Six Sigma is a strong plus for the current role."
                  className="w-full text-[13px] text-gray-700 outline-none resize-none bg-transparent"
                ></textarea>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Note 2: Language Competency
                </label>
                <textarea
                  rows={4}
                  defaultValue="Native level English proficiency, observed during technical interview. Arabic skills are foundational but sufficient for basic site communication."
                  className="w-full text-[13px] text-gray-700 outline-none resize-none bg-transparent"
                ></textarea>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Note 3: Personality & Adaptability
                </label>
                <textarea
                  rows={4}
                  defaultValue="Highly adaptable mindset. Previous exposure to Gulf work environment ensures quick onboarding. Demonstrated high emotional intelligence in situational questions."
                  className="w-full text-[13px] text-gray-700 outline-none resize-none bg-transparent"
                ></textarea>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Note 4: Final Recommendation Summary
                </label>
                <textarea
                  rows={4}
                  defaultValue="Strong candidate for the Senior Engineering Lead position. Experience profile aligns perfectly with project requirements. Recommend proceeding to final partner round."
                  className="w-full text-[13px] text-gray-700 outline-none resize-none bg-transparent"
                ></textarea>
              </div>
            </div>
          </div>

          {/* SIGNATURES & SUBMIT */}    // Use fILE UPLOAD Intead Signature manual
          <div className="mt-12 flex flex-col md:flex-row justify-between items-end gap-10">
            <div className="flex w-full md:w-[60%] gap-10">
              <div className="flex-1 text-center border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6">
                  Candidate Signature
                </p>
              </div>
              <div className="flex-1 text-center border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-6">
                  Assessment by Signature
                </p>
              </div>
            </div>

            <button className="bg-[#43dd95] hover:bg-green-500 text-white font-extrabold px-12 py-3.5 rounded-lg transition-colors shadow-sm tracking-widest text-[14px]">
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[20px] shadow-[0px_4px_18px_rgba(0,0,0,0.04)] border border-gray-200 p-6 md:p-8 font-sans text-gray-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 className="text-[28px] font-medium text-gray-700 tracking-tight">
          TAC Assignment Dashboard
        </h1>
      </div>

      {/* KPI SECTION */}
      <h2 className="text-[19px] font-semibold text-gray-900 mb-5">
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

      <h2 className="text-[19px] font-bold text-gray-900 mb-5">
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
            <select className="w-full md:w-auto border border-gray-200 text-gray-700 text-[12px] rounded-lg pl-4 pr-10 py-2.5 outline-none appearance-none bg-white cursor-pointer hover:bg-gray-50 font-medium">
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
            <select className="w-full md:w-auto border border-gray-200 text-gray-700 text-[12px] rounded-lg pl-4 pr-10 py-2.5 outline-none appearance-none bg-white cursor-pointer hover:bg-gray-50 font-medium">
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
            <tr className="text-gray-500 text-[13px]">
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
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setCurrentView("detail");
                }}
                className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="font-semibold text-[13px] text-gray-800">
                    {candidate.name}
                  </p>
                  <p className="text-[12px] font-medium text-gray-500 mt-0.5">
                    {candidate.id}
                  </p>
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">
                  {candidate.stage}
                </td>
                <td className="py-3 px-4 font-medium text-gray-600">
                  {candidate.token}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${getBadgeStyle(candidate.status)}`}
                  >
                    {candidate.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium tracking-wider text-gray-600 text-[13px]">
                  {candidate.time}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end items-center gap-4 text-gray-400">
                    <button className="hover:text-gray-700 bg-transparent border-none p-0 transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.8"
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
                    <button className="hover:text-gray-700 bg-transparent border-none p-0 transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.8"
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
                    <button className="hover:text-gray-700 bg-transparent border-none p-0 transition-colors">
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        strokeWidth="1.8"
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
