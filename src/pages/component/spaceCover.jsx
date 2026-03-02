import React from "react";

export const SpaceCover = ({ image, name, description, className = "" }) => {
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
      className={`group relative w-full overflow-hidden rounded-t-lg aspect-[10/6] ${className}`}
    >
      {/* Background */}
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
        <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
      )}

      {/* Letter and Name Overlay - only show when no image */}
      {!image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="text-6xl font-bold mb-2 opacity-90 font-serif">{letter}</div>
          <div className="text-sm font-medium opacity-80 text-center px-4 truncate max-w-full font-serif">
            {name}
          </div>
        </div>
      )}

      {/* Hover Description */}
      {description && (
        <div
          className="absolute bottom-0 left-0 right-0 p-4
          bg-gradient-to-t from-black/70 via-black/40 to-transparent
          text-white text-sm
          opacity-0 translate-y-2
          transition-all duration-300
          group-hover:opacity-100 group-hover:translate-y-0"
        >
          {description}
        </div>
      )}
    </div>
  );
};
