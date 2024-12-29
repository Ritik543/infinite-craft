import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import Draggable from "react-draggable";

interface ElementCardNonDraggableProps {
  name: string;
  emoji: string;
  onClick: () => void;
  className?: string;
}

const ElementCardNonDraggable = ({
  name,
  emoji,
  onClick,
  className,
}: ElementCardNonDraggableProps) => {
  const [drag, setDrag] = useState(false);

  return (
    <Draggable
      onDrag={() => setDrag(true)}
      onStop={() => setDrag(false)}
      bounds="parent"
    >
      <div
        className={twMerge(
          "relative bg-white cursor-pointer p-3 rounded-md shadow-md border border-gray-200 hover:shadow-lg transition duration-300 ease-in-out max-h-12 overflow-hidden group",
          className
        )}
        onClick={onClick}
      >
        {/* Hover gradient effect */}
        <div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-blue-400 to-transparent transition-all duration-300 ease-in-out group-hover:h-full z-[-1] rounded-md"></div>

        {/* Content */}
        <span className="relative z-10">
          <span className="">{emoji}</span> {name}
        </span>
      </div>
    </Draggable>
  );
};

export default ElementCardNonDraggable;
