import React from "react";
import { useNavigate, useParams } from "react-router";
import Sidebar from "../component/sidebar";
import { FiChevronLeft } from "react-icons/fi";
import { useSpace } from "../../contexts/space/useSpace";
import { useUser } from "../../contexts/user/useUser";

const UserPeoplePage = () => {
  const { user } = useUser();
  const { userSpaces, friendSpaces } = useSpace();
  const navigate = useNavigate();
  const { space_uuid } = useParams();

  // Combine user and friend spaces
  const allSpaces = [...(userSpaces || []), ...(friendSpaces || [])];
  const activeSpace = allSpaces.find((s) => s.space_uuid === space_uuid);

  // Handle not found
  if (!activeSpace) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-[#161A20]">
        <p className="text-xl">Space not found.</p>
      </div>
    );
  }


  // Separate creator/admin and other members
  const creator = activeSpace.members.find((m) => m.role === "creator") || {
    account_id: user.id,
    full_name: "You",
    profile_pic: user.profile_pic,
    role: "creator"
  };
  const otherMembers = activeSpace.members.filter((m) => m.role !== "creator");


  console.log(activeSpace)
  return (
    <div className="flex min-h-screen bg-[#161A20] text-white">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* COVER IMAGE */}
        <div className="relative">
          <img
            src="/src/assets/UserSpace/cover.png"
            alt="Space Cover"
            className="w-full h-52 object-cover"
          />

                  </div>

        {/* PAGE HEADER */}
        <div className="px-10 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold underline underline-offset-4">
              People – {activeSpace.space_name}
            </h1>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <FiChevronLeft />
              Back
            </button>
          </div>

          {/* CREATOR / ADMIN SECTION */}
          {creator && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Adviser</h2>
              <div className="border-t border-gray-600 pt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={creator.profile_pic || "/src/assets/default-avatar.jpg"}
                    alt={creator.full_name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="font-medium">{creator.full_name}</span>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Students</h2>
            <div className="border-t border-gray-600 pt-4 space-y-4">
              {otherMembers.length > 0 ? (
                otherMembers.map((member) => (
                  <div key={member.account_id} className="flex items-center gap-4">
                    <img
                      src={member.profile_pic || "/src/assets/default-avatar.jpg"}
                      alt={member.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{member.account_id !== user.id ? member.full_name : "You"}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No members yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPeoplePage;
