import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Sidebar from "../component/sidebar";
import Logout from "../component/logout";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { useSpaceTheme } from "../../contexts/theme/useSpaceTheme";
import { FiFolder, FiBook, FiUsers } from "react-icons/fi";

const statusStyles = {
  Done: "border-2 border-[#00B865] text-[#10E164]",
  "In Progress": "border-[#0066D2] text-[#4D9BEF]",
  Missing: "border-[#FF5252] text-[#FF5252]",
};

const TaskPage = () => {
  const { user } = useUser();
  const { userSpaces, courseSpaces, friendSpaces } = useSpace();
  const { isDarkMode, colors } = useSpaceTheme();
  const currentColors = isDarkMode ? colors.dark : colors.light;

  // const allSpaces = new Set(userSpaces.map(space => space.space_id));
  const allSpaces = new Set([
    ...(userSpaces || []).map((space) => space.space_uuid),
    ...(courseSpaces || []).map((space) => space.space_uuid),
  ]);

  // const allFriendSpaces = friendSpaces.filter(
  //   space => !allSpaces.has(space.space_id)
  // );
  const allFriendSpaces = (friendSpaces || []).filter(
    (space) =>
      !allSpaces.has(space.space_uuid) &&
      space.members?.some((member) => member.account_id === user?.id),
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  // sticky header scroll state
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: isDarkMode ? "#161A20" : currentColors.background,
        color: currentColors.text,
      }}
    >
      {/* Desktop Sidebar (Laptop & Desktop) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile + Tablet Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 lg:hidden
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* 🔥 Sticky Mobile Header */}
        <div
          className={`lg:hidden fixed top-0 left-0 right-0 z-30 border-b
          transition-transform duration-300
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
          style={{
            backgroundColor: isDarkMode ? "#161A20" : currentColors.surface,
            borderColor: isDarkMode ? "#374151" : currentColors.border,
            color: isDarkMode ? "white" : currentColors.text,
          }}
        >
          <div className="p-4 flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="bg-transparent border-none text-2xl p-0"
              style={{ color: isDarkMode ? "white" : currentColors.text }}
            >
              ☰
            </button>
            <h1
              className="text-lg font-bold"
              style={{ color: currentColors.text }}
            >
              Tasks
            </h1>
          </div>
        </div>

        {/* 🔽 Added spacing here (pt-20) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 sm:pt-24 lg:pt-10 overflow-y-auto">
          <h1 className="hidden lg:block text-2xl lg:text-4xl font-bold text-center mb-6 lg:mb-10">
            Tasks
          </h1>
          {/* Your Space Tasks */}
          {userSpaces && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Space</h2>
              {userSpaces?.length === 0 ? (
                <div
                  className="rounded-xl p-8 text-center border border-dashed max-w-xl mx-auto"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FiFolder
                      className="w-10 h-10"
                      style={{ color: currentColors.textSecondary }}
                    />
                    <span>No space task yet</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {userSpaces?.map((space, index) => (
                    <div
                      key={`your-space-${index}`}
                      className="border rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onClick={() =>
                        navigate(
                          `/task/${space.space_uuid}/${space.space_name}`,
                        )
                      }
                    >
                      <span className="text-xl">📋</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">
                          {space.space_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Course Space Tasks */}
          {courseSpaces && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Course Space</h2>
              {courseSpaces?.length === 0 ? (
                <div
                  className="rounded-xl p-8 text-center border border-dashed max-w-xl mx-auto"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FiBook
                      className="w-10 h-10"
                      style={{ color: currentColors.textSecondary }}
                    />
                    <span>No course space task yet</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {courseSpaces?.map((space, index) => (
                    <div
                      key={`course-space-${index}`}
                      className="border rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onClick={() =>
                        navigate(
                          `/task/${space.space_uuid}/${space.space_name}`,
                        )
                      }
                    >
                      <span className="text-xl">📋</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">
                          {space.space_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}

          {/* Friends Space Tasks */}
          {allFriendSpaces && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Friends Space</h2>
              {allFriendSpaces?.length === 0 ? (
                <div
                  className="rounded-xl p-8 text-center border border-dashed max-w-xl mx-auto"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgb(30 36 46 / var(--tw-bg-opacity, 1))"
                      : currentColors.surface,
                    color: currentColors.textSecondary,
                    borderColor: isDarkMode ? currentColors.border : "black",
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <FiUsers
                      className="w-10 h-10"
                      style={{ color: currentColors.textSecondary }}
                    />
                    <span>No friends space task yet</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-3xl mx-auto">
                  {allFriendSpaces?.map((space, index) => (
                    <div
                      key={`friends-space-${index}`}
                      className="border rounded-lg px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 transition cursor-pointer"
                      style={{
                        backgroundColor: currentColors.surface,
                        borderColor: currentColors.border,
                      }}
                      onClick={() =>
                        navigate(
                          `/task/${space.space_uuid}/${space.space_name}`,
                        )
                      }
                    >
                      <span className="text-xl">📋</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium truncate overflow-hidden whitespace-nowrap">
                          {space.space_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-b border-gray-700 my-6"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
