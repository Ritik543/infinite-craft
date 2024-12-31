import React, { useState, useEffect } from "react";

interface Element {
  name: string;
  emoji: string;
  time?: string; // Assuming `time` is optional or present in the elements
}

interface SidebarProps {
  elements: Element[];
  deleteMode: boolean;
  markedForDeletion: string[];
  handleClick: (elementName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  elements,
  deleteMode,
  markedForDeletion,
  handleClick,
}) => {
  const [sortedElements, setSortedElements] = useState<Element[]>(elements);
  const [currentSort, setCurrentSort] = useState<"time" | "name" | "emoji">(
    "time"
  );

  // Update sortedElements whenever the elements prop changes
  useEffect(() => {
    setSortedElements(elements);
  }, [elements]);

  const toggleSorting = () => {
    let nextSort: "time" | "name" | "emoji";
    let sorted: Element[];

    if (currentSort === "time") {
      nextSort = "name";
      sorted = [...sortedElements].sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSort === "name") {
      nextSort = "emoji";
      sorted = [...sortedElements].sort((a, b) =>
        a.emoji.localeCompare(b.emoji)
      );
    } else {
      nextSort = "time";
      sorted = [...elements]; // Reset to original order
    }

    setCurrentSort(nextSort);
    setSortedElements(sorted);
  };

  const handleElementClick = (elementName: string) => {
    handleClick(elementName);
  };

  const handleDragStart = (elementName: string) => {
    handleClick(elementName); // Select the element for drag-and-drop
  };

  return (
    <div
      className={`fixed bg-white shadow-md border-gray-300
                    lg:w-80 lg:h-full lg:top-0 lg:right-0 
                    w-full h-1/2 bottom-0 border-t z-50 
                    transition-all overflow-y-scroll lg:overflow-none`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <h2 className="text-lg font-bold mb-4">Infinite Craft</h2>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-60px)]">
          <div className="flex flex-row gap-5 flex-wrap justify-center mt-5">
            {sortedElements.map((element, index) => (
              <div
                key={index}
                className={`relative bg-white shadow-md border border-gray-300 rounded-md p-3 gap-2 flex items-center justify-center cursor-pointer hover:shadow-lg group transition duration-300 ease-in-out ${
                  deleteMode && markedForDeletion.includes(element.name)
                    ? "opacity-50 bg-red-100" // Highlight marked cards in delete mode
                    : ""
                }`}
                draggable
                onClick={() => handleElementClick(element.name)}
                onDragStart={() => handleDragStart(element.name)}
              >
                {deleteMode && (
                  <button
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 z-10 hover:bg-red-600 transition"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click event propagation
                      handleElementClick(element.name);
                    }}
                  >
                    ✕
                  </button>
                )}
                <span className="text-xl font-medium">{element.emoji}</span>
                <span className="text-sm font-medium z-10 mt-1">
                  {element.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 mt-4 border-t border-gray-300 bg-gray-50 flex gap-4 justify-between 
                        lg:gap-4"
        >
          {/* Dashboard Button */}
          <button
            className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out"
            onClick={() => alert("Redirecting to Dashboard...")}
          >
            Dashboard
          </button>

          {/* Sort Button */}
          <button
            className="text-blue-500 hover:text-blue-600 font-semibold px-4 py-2 border rounded hover:shadow-md transition duration-300 ease-in-out"
            onClick={toggleSorting}
          >
            {`Sort by ${
              currentSort === "time"
                ? "Name"
                : currentSort === "name"
                ? "Emoji"
                : "Time"
            }`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
