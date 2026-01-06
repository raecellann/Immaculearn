import React from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import { FiChevronLeft } from "react-icons/fi";

const UserPeoplePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* COVER IMAGE */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b"
            alt="Space Cover"
            className="w-full h-52 object-cover"
          />

          {/* SPACE TITLE */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black px-10 py-3 rounded-b-xl text-2xl font-extrabold">
            Zeldrick’s Space
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="px-10 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold underline underline-offset-4">
              People – Zeldrick’s Space
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition bg-transparent"
            >
              <FiChevronLeft />
              Back
            </button>
          </div>

          {/* ADMIN SECTION */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Admin</h2>
            <div className="border-t border-gray-600 pt-4">
              <div className="flex items-center gap-4">
                <img
                  src="/src/assets/SpacePeoplePage/zj.jpg"
                  alt="Admin"
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-medium">
                  Zeldrick Jesus Delos Santos
                </span>
              </div>
            </div>
          </div>

          {/* MEMBERS SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="border-t border-gray-600 pt-4 space-y-4">
              {[
                {
                  name: "Raecell Ann Galvez",
                  img: "/src/assets/SpacePeoplePage/raecell.jpg",
                },
                {
                  name: "Nathaniel Fabordada",
                  img: "/src/assets/SpacePeoplePage/nath.jpg",
                },
                {
                  name: "Wilson Esmabe",
                  img: "/src/assets/SpacePeoplePage/wilson.jpg",
                },
              ].map((member, index) => (
                <div key={index} className="flex items-center gap-4">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPeoplePage;
