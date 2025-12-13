import React from "react";
import Sidebar from "../component/sidebar";
import { FiSearch } from 'react-icons/fi';

const UserPage = () => {

  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* COVER PHOTO */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Cover"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          {/* SEARCH BAR OVERLAY */}
          <div className="absolute top-4 right-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-[#1B1F26] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* HEADER AREA */}
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold">Zeldrick’s Space</h1>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-gray-400 text-xs">3 Members</p>
              <button className="px-1 py-0.5 bg-blue-600 rounded text-xs hover:bg-blue-700 transition">
                Add Member
              </button>
            </div>
          </div>

          {/* NAV TABS */}
          <div className="flex justify-center gap-6 mt-6 border-b border-gray-700 pb-2">
            <button className="text-white font-semibold border-b-2 border-white pb-1">
              Stream
            </button>
            <button className="text-gray-400 hover:text-white">Tasks</button>
            <button className="text-gray-400 hover:text-white">
              Files Shared
            </button>
            <button className="text-gray-400 hover:text-white">People</button>
          </div>

          {/* POST BOX */}
          <div className="mt-6">
            <div className="relative">
              <img
                src="/src/assets/HomePage/frieren-avatar.jpg"
                alt="Avatar"
                className="absolute left-3 top-3 w-10 h-10 rounded-full border-2 border-white"
              />
              <textarea
                placeholder="Post something to your space"
                className="w-full bg-white text-black border border-gray-300 rounded-lg pl-16 pr-3 py-3 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* REMINDERS BOX */}
            <div className="bg-[#0D0F14] border border-gray-700 rounded-xl p-5">
              <h2 className="text-lg font-bold mb-4">Reminders</h2>

              <div className="space-y-3">
                <div className="p-3 bg-[#141820] rounded-lg">
                  <h3 className="font-semibold">Week 7 Reflection Paper</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Operating Systems – Oct 17
                  </p>
                </div>

                <div className="p-3 bg-[#141820] rounded-lg">
                  <h3 className="font-semibold">Week 7 Individual Activity</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Operating Systems – Oct 17
                  </p>
                </div>
              </div>

              <button className="mt-4 text-blue-400 hover:underline text-sm">
                View All
              </button>

              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-semibold transition">
                Enter Chat
              </button>
            </div>

            {/* ACTIVITY FEED */}
            <div className="col-span-2 space-y-4">
              {/* FILE ITEM */}
              <div className="bg-[#1B1F26] p-4 rounded-xl border border-gray-700 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    Zeldrick shared a file with you
                  </h3>
                  <p className="text-xs text-gray-400">OS – Week 7 Lecture</p>
                </div>

                <button className="text-blue-400 hover:underline text-sm">
                  See File
                </button>
              </div>

              <div className="bg-[#1B1F26] p-4 rounded-xl border border-gray-700 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    Zeldrick assigned a task with you
                  </h3>
                  <p className="text-xs text-gray-400">
                    Thesis – Survey Revision
                  </p>
                </div>

                <button className="text-blue-400 hover:underline text-sm">
                  See Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
