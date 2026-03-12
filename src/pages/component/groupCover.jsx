import React from "react";

export const GroupCover = ({ image, name = "", members = [], className }) => {
  const letter = name?.charAt(0)?.toUpperCase() || "?";

  const colors = [
    "from-blue-600 to-indigo-700",
    "from-emerald-500 to-teal-600", 
    "from-purple-600 to-pink-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-sky-600",
  ];

  const color = colors[(letter.charCodeAt(0) - 65) % colors.length] || colors[0];

  // Use group image if available
  if (image) {
    return <img src={image} alt={name} className={`rounded-full object-cover ${className}`} />;
  }

  const visibleMembers = members.filter(Boolean).slice(0, 2);

  // Helper: get first letter
  const getInitial = (text) =>
    text?.trim()?.charAt(0)?.toUpperCase() || "?";

  // Show space name initial with gradient when no image is provided
  if (visibleMembers.length <= 1) {
    return (
      <div
        className={`flex items-center justify-center text-white font-semibold rounded-full bg-gradient-to-br ${color} ${className}`}
      >
        {letter}
      </div>
    );
  }

  // 1 member
  // if (visibleMembers.length === 1) {
  //   const member = visibleMembers[0];

  //   return member.profile_pic ? (
  //     <img
  //       src={member.profile_pic}
  //       alt={member.full_name}
  //       className={className}
  //     />
  //   ) : (
  //     <div
  //       className={`flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full ${className}`}
  //     >
  //       {getInitial(member.full_name)}
  //     </div>
  //   );
  // }

  // 2 members
  return (
    <div
      className={`relative w-10 h-10 rounded-full overflow-hidden ${className}`}
    >
      {visibleMembers.map((member, index) =>
        member.profile_pic ? (
          <img
            key={index}
            src={member.profile_pic}
            alt={member.full_name}
            className={`absolute w-7 h-7 object-cover rounded-full border-2 border-white ${
              index === 0 ? "top-0 right-0" : "bottom-0 left-0"
            }`}
          />
        ) : (
          <div
            key={index}
            className={`absolute w-7 h-7 flex items-center justify-center text-white text-xs font-semibold rounded-full border-2 border-white bg-gradient-to-br ${
              index === 0 ? "top-0 right-0" : "bottom-0 left-0"
            } ${colors[(getInitial(member.full_name).charCodeAt(0) - 65) % colors.length] || colors[0]}`}
          >
            {getInitial(member.full_name)}
          </div>
        )
      )}
    </div>
  );
};
