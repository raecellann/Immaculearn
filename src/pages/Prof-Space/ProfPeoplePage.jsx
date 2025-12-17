import React from "react";
import { useNavigate } from "react-router";
import ProfSidebar from "../component/profsidebar";
import { FiChevronLeft } from "react-icons/fi";

const ProfPeoplePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <ProfSidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* HEADER / BANNER */}
        <div className="relative mb-6">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Space Banner"
            className="w-full h-48 object-cover opacity-90 rounded-b-xl rounded-t-none"
          />

          {/* TITLE */}
          <div className="absolute top-0 z-10">
            <div className="bg-black text-white px-10 py-3 rounded-b-[1rem] rounded-t-none shadow-lg text-2xl font-extrabold text-left">
              CS Thesis 2 Space
            </div>
          </div>
        </div>

        {/* TITLE ROW */}
        <div className="relative flex justify-between items-center mb-6">
          <div className="w-20"></div> {/* Spacer to balance the back button */}
          <h1 className="text-2xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            People – CS Thesis 2 Space
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-gray-300 hover:text-white"
          >
            <FiChevronLeft className="mr-1" />
            Back
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-10 mt-8">
          {/* ADMIN */}
          <h2 className="text-lg font-semibold mb-2">Admin</h2>
          <hr className="border-white/10 mb-4" />

          <div className="flex items-center space-x-4 mb-8">
            <img
              src="/src/assets/HomePage/frieren-avatar.jpg"
              alt="Susana Tolentino"
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="text-sm">Susana Tolentino</span>
          </div>

          {/* MEMBERS */}
          <h2 className="text-lg font-semibold mb-2">Members</h2>
          <hr className="border-white/10 mb-4" />

          <div className="space-y-5">
            {[
              "Zeldrick Jesus Delos Santos",
              "Raecell Ann Galvez",
              "Nathaniel Faborada",
              "Wilson Esmobe",
            ].map((name, index) => (
              <div key={index} className="flex items-center space-x-4">
                <img
                  src="/src/assets/HomePage/frieren-avatar.jpg"
                  alt={name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfPeoplePage;