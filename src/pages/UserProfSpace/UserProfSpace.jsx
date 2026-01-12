import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "../../contexts/user/useUser";

const UserProfSpace = () => {
  const { user } = useUser();
  const [showMenu, setShowMenu] = useState(null);
  const navigate = useNavigate();
  const { subject } = useParams(); // Get subject from URL

  // 🔹 ADDED: mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 🔹 ADDED: hide-on-scroll state
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Professor space data based on subject
  const getSpaceData = (subject) => {
    const spaceDataMap = {
      thesis: {
        title: "Thesis and Research",
        image: "/src/assets/SpacesCover/thesis.jpg",
        time: "Opened 1 min ago",
        category: "Classroom Space",
        members: 32,
        yearLevel: "4th Year",
        instructor: "Prof. Smith",
        description: "Advanced research methodology and thesis writing for 4th year students",
        schedule: "MWF 10:00-11:30 AM",
        color: "blue"
      },
      os: {
        title: "Operating System",
        image: "/src/assets/SpacesCover/os.jpg",
        time: "Opened 3 mins ago",
        category: "Classroom Space",
        members: 40,
        yearLevel: "3rd Year",
        instructor: "Prof. Johnson",
        description: "Operating system concepts and implementation for 3rd year students",
        schedule: "TTH 2:00-3:30 PM",
        color: "green"
      },
      cselec2: {
        title: "CS-ELEC 2",
        image: "/src/assets/SpacesCover/code.jpg",
        time: "Opened 5 mins ago",
        category: "Classroom Space",
        members: 28,
        yearLevel: "3rd Year",
        instructor: "Prof. Davis",
        description: "Advanced programming concepts and elective topics for 3rd year students",
        schedule: "MWF 8:00-9:30 AM",
        color: "purple"
      },
      businteg: {
        title: "Businteg",
        image: "/src/assets/SpacesCover/businteg.jpg",
        time: "Opened just now",
        category: "Classroom Space",
        members: 35,
        yearLevel: "4th Year",
        instructor: "Prof. Wilson",
        description: "Business integration and systems analysis for 4th year students",
        schedule: "TTH 10:00-11:30 AM",
        color: "orange"
      },
      modtech: {
        title: "Modtech",
        image: "/src/assets/SpacesCover/modtech.jpg",
        time: "Opened just now",
        category: "Classroom Space",
        members: 30,
        yearLevel: "4th Year",
        instructor: "Prof. Brown",
        description: "Modern technology and innovation for 4th year students",
        schedule: "MWF 2:00-3:30 PM",
        color: "pink"
      },
      datastructure: {
        title: "Data Structure",
        image: "/src/assets/SpacesCover/datastructure.jpg",
        time: "Opened 5 days ago",
        category: "Classroom Space",
        members: 41,
        yearLevel: "1st Year",
        instructor: "Prof. Miller",
        description: "Data structures and algorithms for 1st year students",
        schedule: "TTH 8:00-9:30 AM",
        color: "teal"
      },
      pe2: {
        title: "Physical Education 2",
        image: "/src/assets/SpacesCover/pe.jpg",
        time: "Opened 1 week ago",
        category: "Classroom Space",
        members: 45,
        yearLevel: "2nd Year",
        instructor: "Prof. Garcia",
        description: "Physical fitness and sports activities for 2nd year students",
        schedule: "WF 1:00-2:30 PM",
        color: "red"
      },
      uts: {
        title: "Understanding the Self",
        image: "/src/assets/SpacesCover/uts.jpg",
        time: "Opened 4 weeks ago",
        category: "Classroom Space",
        members: 52,
        yearLevel: "2nd Year",
        instructor: "Prof. Martinez",
        description: "Personal development and self-awareness for 2nd year students",
        schedule: "MWF 11:00-12:30 PM",
        color: "indigo"
      },
      mmw: {
        title: "MMW",
        image: "/src/assets/SpacesCover/mmw.jpg",
        time: "Opened 2 days ago",
        category: "Classroom Space",
        members: 28,
        yearLevel: "1st Year",
        instructor: "Prof. Anderson",
        description: "Mathematics in the modern world for 1st year students",
        schedule: "TTH 3:00-4:30 PM",
        color: "yellow"
      }
    };

    return spaceDataMap[subject] || spaceDataMap.thesis; // Default to thesis if no subject found
  };

  const spaceData = getSpaceData(subject);

  // Mock activities based on subject
  const getActivities = (subject) => {
    const activityTemplates = {
      thesis: [
        {
          id: 1,
          title: "Thesis Proposal Submission",
          description: "Submit your thesis proposal for review",
          dueDate: "2026-01-20",
          dueTime: "11:59 PM",
          priority: "high",
          status: "pending",
          type: "Assignment"
        },
        {
          id: 2,
          title: "Literature Review Draft",
          description: "Complete literature review chapter",
          dueDate: "2026-01-25",
          dueTime: "5:00 PM",
          priority: "medium",
          status: "pending",
          type: "Paper"
        }
      ],
      os: [
        {
          id: 1,
          title: "Process Scheduling Assignment",
          description: "Implement CPU scheduling algorithms",
          dueDate: "2026-01-22",
          dueTime: "11:59 PM",
          priority: "high",
          status: "pending",
          type: "Assignment"
        },
        {
          id: 2,
          title: "Memory Management Lab",
          description: "Complete lab exercises on memory allocation",
          dueDate: "2026-01-25",
          dueTime: "5:00 PM",
          priority: "medium",
          status: "pending",
          type: "Lab Activity"
        }
      ],
      cselec2: [
        {
          id: 1,
          title: "Advanced Algorithm Project",
          description: "Implement advanced sorting algorithms",
          dueDate: "2026-01-23",
          dueTime: "11:59 PM",
          priority: "high",
          status: "pending",
          type: "Project"
        },
        {
          id: 2,
          title: "Code Review Session",
          description: "Peer review of coding assignments",
          dueDate: "2026-01-26",
          dueTime: "3:00 PM",
          priority: "medium",
          status: "pending",
          type: "Presentation"
        }
      ],
      businteg: [
        {
          id: 1,
          title: "Business Case Study Analysis",
          description: "Analyze real-world business integration cases",
          dueDate: "2026-01-24",
          dueTime: "11:59 PM",
          priority: "high",
          status: "pending",
          type: "Case Study"
        },
        {
          id: 2,
          title: "Systems Design Document",
          description: "Create comprehensive system design documentation",
          dueDate: "2026-01-28",
          dueTime: "5:00 PM",
          priority: "medium",
          status: "pending",
          type: "Documentation"
        }
      ]
    };

    return activityTemplates[subject] || activityTemplates.thesis;
  };

  const activities = getActivities(subject);

  // Color classes based on subject
  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "from-blue-600 to-blue-700",
        text: "text-blue-100",
        badge: "bg-blue-600"
      },
      green: {
        bg: "from-green-600 to-green-700",
        text: "text-green-100",
        badge: "bg-green-600"
      },
      purple: {
        bg: "from-purple-600 to-purple-700",
        text: "text-purple-100",
        badge: "bg-purple-600"
      },
      orange: {
        bg: "from-orange-600 to-orange-700",
        text: "text-orange-100",
        badge: "bg-orange-600"
      },
      pink: {
        bg: "from-pink-600 to-pink-700",
        text: "text-pink-100",
        badge: "bg-pink-600"
      },
      teal: {
        bg: "from-teal-600 to-teal-700",
        text: "text-teal-100",
        badge: "bg-teal-600"
      },
      red: {
        bg: "from-red-600 to-red-700",
        text: "text-red-100",
        badge: "bg-red-600"
      },
      indigo: {
        bg: "from-indigo-600 to-indigo-700",
        text: "text-indigo-100",
        badge: "bg-indigo-600"
      },
      yellow: {
        bg: "from-yellow-600 to-yellow-700",
        text: "text-yellow-100",
        badge: "bg-yellow-600"
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const colorClasses = getColorClasses(spaceData.color);

    return (
    <div className="flex font-sans min-h-screen bg-[#161A20] text-white">
        {/* ================= Desktop Sidebar (Laptop+) ================= */}
        <div className="hidden lg:block">
        <Sidebar />
        </div>

        {/* ================= Mobile + Tablet Overlay ================= */}
        {mobileSidebarOpen && (
        <div
            className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
        />
        )}

        {/* ================= Tablet Sidebar ================= */}
        <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E222A] z-50 transform transition-transform duration-300 
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:block lg:hidden`}
        >
        <Sidebar />
        </div>

        {/* ================= Main Content ================= */}
        <div className="flex-1 flex flex-col">
        {/* ================= Header (Mobile + Tablet) ================= */}
        <div
            className={`lg:hidden bg-[#1E222A] p-4 border-b border-[#3B4457] flex items-center gap-4 fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
            showHeader ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <button
            onClick={() => setMobileSidebarOpen(true)}
            className="bg-transparent border-none text-white text-2xl p-0 focus:outline-none"
            >
            ☰
            </button>
            <h1 className="text-xl font-bold">{spaceData.title}</h1>
        </div>

        {/* ================= Page Content Placeholder ================= */}
        <div className="pt-20 px-6">
            {/* Your activities / content go here */}
        </div>
        </div>
    </div>
    );

};

export default UserProfSpace;
