import React from "react";

export const SpaceCover = ({
  image,
  name,
  className = "",
}) => {
  const letter = name?.charAt(0)?.toUpperCase() || "?";

  const colors = [
    "from-blue-600 to-indigo-700",
    "from-emerald-500 to-teal-600",
    "from-purple-600 to-pink-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-sky-600",
  ];

  const color =
    colors[(letter.charCodeAt(0) - 65) % colors.length] || colors[0];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-t-lg ${className} aspect-[10/6]`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition duration-300 group-hover:brightness-75"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center
          bg-gradient-to-br ${color} text-white`}
        >
          <span className="text-4xl font-bold select-none">
            {letter}
          </span>
        </div>
      )}
    </div>
  );
};
