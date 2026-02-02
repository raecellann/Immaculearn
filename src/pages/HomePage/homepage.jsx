import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import Button from "../component/Button";
import { BookOpen, User, GraduationCap, FileText, Calendar } from "lucide-react";
import { useUser } from "../../contexts/user/useUser";
import { useSpace } from "../../contexts/space/useSpace";
import { capitalizeWords } from "../../utils/capitalizeFirstLetter";
import { useNavigate } from "react-router";
import { SpaceCover } from "../component/spaceCover";
// import { useSpace } from "../../contexts/space/spaceContext";

const HomePage1 = () => {
  const { user } = useUser();
  const { userSpaces, friendSpaces } = useSpace();

  const navigate = useNavigate();


  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [today, setToday] = useState(new Date());
  const [slideIndexYourSpace, setSlideIndexYourSpace] = useState(0);
  const [slideIndexSpaces, setSlideIndexSpaces] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);

  const role = urlParams.get("role");

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    const weekday = now.toLocaleString('default', { weekday: 'long' });
    setCurrentDate(`${month} ${day}, ${year} (${weekday})`);


    const hour = now.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setToday(now);
  }, []);

  const userSpaceUUIDs = new Set(
    (userSpaces || []).map(space => space.space_uuid)
  );

  const sharedSpaces = (friendSpaces || []).filter(
    space => !userSpaceUUIDs.has(space.space_uuid)
  );

  return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex p-8 gap-6">
        {/* CENTER CONTENT */}
        <div className="flex-1">
          {/* Title and Date ABOVE the card */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white font-grotesque">
              Get Productive Today!
            </h2>
            <p className="text-gray-400 text-sm font-inter">{currentDate}</p>
          </div>

          {/* Header Card */}
          <div className="bg-[#1E242E] rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-[#B0C4FF] mb-1">
                  {greeting}, {user && user.name}
                </h1>
                <p className="text-gray-400 text-sm">
                  Meet your classmates and collaborate with them.
                </p>
                <p className="text-gray-400 text-sm">
                  Join space or create your own.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => navigate("/space/create")} >Create Space
                    
                  </Button>
                  <Button onClick={() => navigate("/space")} >Join Space</Button>
                </div>
              </div>
              <div>
                <img
                  src="/src/assets/HomePage/book-pen.svg"
                  alt="Book and Pen"
                  className="w-32 h-32 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Your Spaces Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Your Space</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSlideIndexYourSpace(Math.max(0, slideIndexYourSpace - 1))}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent"
                  disabled={slideIndexYourSpace === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => setSlideIndexYourSpace(Math.min(2, slideIndexYourSpace + 1))}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent"
                  disabled={slideIndexYourSpace === 2}
                >
                  ›
                </button>
                <button className="text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
              </div>
            </div>

            <div className="relative overflow-hidden" style={{ width: '632px' }}>
              <div
                className="flex gap-4 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${slideIndexYourSpace * 648}px)` }}
              >
                {/* {[
                  { title: "Lectures", time: "Opened 1 min ago", image: "/src/assets/HomePage/spaces-cover/lectures.jpg" },
                  { title: "Todo-Lists", time: "Opened 5 mins ago", image: "/src/assets/HomePage/spaces-cover/space-board.jpg" },
                  { title: "Subject Grades", time: "Opened 10 mins ago", image: "/src/assets/HomePage/spaces-cover/grades.jpg" },
                  { title: "Notes", time: "Opened 20 mins ago", image: "/src/assets/HomePage/spaces-cover/cover1.jpg" },
                  { title: "Projects", time: "Opened 30 mins ago", image: "/src/assets/HomePage/spaces-cover/cover2.jpg" }
                ]} */}
                {userSpaces?.map((space, i) => (
                  <div key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/space/${space.space_uuid}/${space.space_name}`)}
                    className="bg-[#1E242E] rounded-lg hover:bg-[#242B38] transition min-w-[200px]">
                    {/* <img
                      src={space.image || "/src/assets/HomePage/spaces-cover/lectures.jpg"}
                      alt={space.space_name || "SAMPLE NAME"}
                      className="h-28 w-full object-cover rounded-lg mb-3"
                    /> */}
                    <SpaceCover 
                      image={space.image}
                      name={space.space_name}
                      className="h-32 w-full"
                    />
                    <div className="p-4">
                      <h3 className="font-medium truncate">{capitalizeWords(space.space_name) + "'s Space" || "SAMPLE SPACE NAME"}</h3>
                      <p className="text-gray-500 text-xs mt-1">{space.time || "2038-01-01"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spaces Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Spaces</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSlideIndexSpaces(Math.max(0, slideIndexSpaces - 1))}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent"
                  disabled={slideIndexSpaces === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => setSlideIndexSpaces(Math.min(2, slideIndexSpaces + 1))}
                  className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded bg-transparent"
                  disabled={slideIndexSpaces === 2}
                >
                  ›
                </button>
                <button className="text-[#007AFF] hover:underline text-sm ml-2 bg-transparent">View All</button>
              </div>
            </div>

            <div className="relative overflow-hidden" style={{ width: '632px' }}>
              <div
                className="flex gap-4 transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${slideIndexSpaces * 648}px)` }}
              >
                {sharedSpaces.map((space, i) => (
                  <div
                    key={i}
                    role="button"
                    onClick={() => navigate(`/space/${space?.space_uuid}/${space.space_name}`)}
                    className="bg-[#1E242E] rounded-xl overflow-hidden transition hover:scale-[1.02] hover:shadow-lg min-w-[200px]"
                  >
                    <div className="relative">
                      {/* <img
                        src={space.image}
                        alt={space.title}
                        className="h-32 w-full object-cover"
                      /> */}
                      <SpaceCover 
                        image={space.background_img}
                        name={space.space_name}
                        className="h-32 w-full"
                      />

                      <div className="absolute top-2 right-2">
                        <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(showMenu === i ? null : i);
              }}
              className="bg-black/60 hover:bg-black text-white w-6 h-6 flex items-center justify-center rounded-md"
            >
              ...
            </button>
                        {showMenu === i && (
                          <div className="absolute top-8 right-0 bg-[#242B38] rounded-lg shadow-lg p-3 min-w-[160px] z-10 border border-[#3B4457]">
                            <div className="flex flex-col gap-2">
                              <button 
                              onClick={() => navigate(`/space/${space?.space_uuid}/${space.space_name}`)}
                              
                              className="w-full text-center px-3 py-2 rounded-full bg-black border border-[#3B4457] text-white text-sm">
                                View Details
                              </button>
                              <button className="w-full text-center px-3 py-2 rounded-full bg-black border border-red-600 text-red-400 text-sm">
                                Leave Space
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-sm">{capitalizeWords(space.space_name) + "'s Space"}</h3>
                      <p className="text-gray-400 text-xs mt-1">{space.members != null ? `${space?.members?.length} Members` : "No members"}</p>
                      <p className="text-gray-500 text-xs mt-1">{space.time || "Opened just now"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Section */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Articles</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#1E242E] h-32 rounded-lg hover:bg-[#242B38] transition"></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-80 bg-[#1E242E] rounded-xl p-6 flex flex-col justify-between">
          {/* Profile */}
          <div className="flex flex-col items-center text-center mb-4">
            <img
              src={user && user.profile_pic}
              alt="Frieren Avatar"
              className="w-20 h-20 rounded-full object-cover mb-3"
            />
            <h3 className="text-lg font-semibold">{user && user.name}</h3>
            <p className="text-gray-400 text-sm">{user && user.role}</p>
            <Button className="homepage-edit-button mt-2">Edit Profile</Button>
          </div>

          {/* Calendar and Reminders Group */}
          <div className="flex flex-col">
            {/* Calendar */}
            <div className="bg-[#1E242E] mb-6 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</h4>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(currentYear - 1);
                      } else {
                        setCurrentMonth(currentMonth - 1);
                      }
                    }}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-transparent"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(currentYear + 1);
                      } else {
                        setCurrentMonth(currentMonth + 1);
                      }
                    }}
                    className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-transparent"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center gap-2 text-gray-400 text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
                {(() => {
                  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
                  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                  const todayDate = today.getDate();
                  const todayMonth = today.getMonth();
                  const todayYear = today.getFullYear();

                  const days = [];
                  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
                    days.push(<span key={`empty-${i}`} className="p-1.5 rounded-md"></span>);
                  }
                  for (let i = 1; i <= daysInMonth; i++) {
                    const isToday = i === todayDate && currentMonth === todayMonth && currentYear === todayYear;
                    days.push(
                      <span
                        key={i}
                        className={`p-1.5 rounded-md cursor-pointer ${
                          isToday ? "bg-[#007AFF] text-white" : "hover:bg-[#2E3440]"
                        }`}
                      >
                        {i}
                      </span>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>

            {/* Reminders */}
            <div>
              <h4 className="font-semibold mb-3">Reminders</h4>
              <ul className="space-y-3 text-sm">
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen className="text-blue-400 w-5 h-5" />
                    <div>
                      <p className="font-medium">Week 7 Reflection Paper</p>
                      <p className="text-gray-400 text-xs">Operating System – Oct 15</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="text-green-400 w-5 h-5" />
                    <div>
                      <p className="font-medium">Week 8 Individual Activity</p>
                      <p className="text-gray-400 text-xs">Data Communications – Oct 24</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-orange-400 w-5 h-5" />
                    <div>
                      <p className="font-medium">Chapter 1 Thesis Paper</p>
                      <p className="text-gray-400 text-xs">Thesis – Oct 28</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="text-purple-400 w-5 h-5" />
                    <div>
                      <p className="font-medium">Midterm Exam Review</p>
                      <p className="text-gray-400 text-xs">Mathematics – Nov 5</p>
                    </div>
                  </div>
                </li>
                <li className="bg-[#2E3440] p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-red-400 w-5 h-5" />
                    <div>
                      <p className="font-medium">Group Project Meeting</p>
                      <p className="text-gray-400 text-xs">Software Engineering – Nov 10</p>
                    </div>
                  </div>
                </li>
              </ul>
              <button className="mt-4 text-[#007AFF] hover:underline text-sm bg-transparent">See All</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage1;
