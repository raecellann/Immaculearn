import React from "react";

export const GroupCover = ({ image, name = "", members = [], className }) => {
  // Use group image if available
  if (image) {
    return <img src={image} alt={name} className={className} />;
  }

  const visibleMembers = members.filter(Boolean).slice(0, 2);

  // Helper: get first letter
  const getInitial = (text) =>
    text?.trim()?.charAt(0)?.toUpperCase() || "?";

  // 0 members → show group name initial
  if (visibleMembers.length === 1) {
    return (
      <div
        className={`flex items-center justify-center bg-blue-500 text-white font-semibold rounded-full ${className}`}
      >
        {getInitial(name)}
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
            className={`absolute w-7 h-7 flex items-center justify-center bg-blue-500 text-white text-xs font-semibold rounded-full border-2 border-white ${
              index === 0 ? "top-0 right-0" : "bottom-0 left-0"
            }`}
          >
            {getInitial(member.full_name)}
          </div>
        )
      )}
    </div>
  );
};
