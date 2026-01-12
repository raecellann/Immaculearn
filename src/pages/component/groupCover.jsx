import React from "react";

export const GroupCover = ({ image, name, members = [], className }) => {
  if (image) {
    return <img src={image} alt={name} className={className} />;
  }

  // fallback: show first 2 member avatars
  const visibleMembers = members.slice(0, 2);

  return (
    <div
      className={`relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {visibleMembers.length === 1 ? (
        <img
          src={visibleMembers[0].profile_pic || "/default-avatar.png"}
          alt={visibleMembers[0].full_name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <>
          <img
            src={visibleMembers[0].profile_pic || "/default-avatar.png"}
            alt={visibleMembers[0].full_name}
            className="absolute w-7 h-7 object-cover rounded-full top-0 right-0 border-2 border-white"
          />
          <img
            src={visibleMembers[1].profile_pic || "/default-avatar.png"}
            alt={visibleMembers[1].full_name}
            className="absolute w-7 h-7 object-cover rounded-full bottom-0 left-0 border-2 border-white"
          />
        </>
      )}
    </div>
  );
};
