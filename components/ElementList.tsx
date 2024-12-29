import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Elements } from "@/Elements";
import axios from "axios";
import { twMerge } from "tailwind-merge";

const ElementList = () => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [elements, setElements] = useState(Elements); // Sidebar elements
  const [elementList, setElementList] = useState(elements); // Main ElementList
  const [deleteMode, setDeleteMode] = useState(false); // Toggle for delete mode
  const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([]); // Cards marked for deletion
  const [error, setError] = useState(false);
  const popSound = useRef<HTMLAudioElement | null>(null);

  const handleClick = (element: string) => {
    if (deleteMode) {
      // Mark card for deletion
      setMarkedForDeletion((prev) =>
        prev.includes(element)
          ? prev.filter((name) => name !== element)
          : [...prev, element]
      );
    } else {
      // Handle element selection for combining
      if (selectedElements.length === 2) {
        setSelectedElements([element]);
      } else {
        setSelectedElements((prev) => [...prev, element]);
      }
    }
  };

  const toggleDeleteMode = () => {
    if (deleteMode) {
      // Confirm deletion: Remove marked cards from both elementList and elements
      const remainingElements = elementList.filter(
        (el) => !markedForDeletion.includes(el.name)
      );
      const remainingSidebarElements = elements.filter(
        (el) => !markedForDeletion.includes(el.name)
      );

      setElementList(remainingElements); // Update ElementList
      setElements(remainingSidebarElements); // Update Sidebar
      setMarkedForDeletion([]); // Clear marked cards
    }
    setDeleteMode(!deleteMode);
  };

  const deleteCraftCards = () => {
    setElementList([]); // Clear all ElementList cards
    // Sidebar cards are not affected
  };

  const clearElements = () => {
    setElements(Elements); // Reset Sidebar elements
    setElementList(Elements); // Reset ElementList
    localStorage.setItem("elements", JSON.stringify(Elements));
  };

  const createElement = async () => {
    if (selectedElements.length === 2) {
      try {
        const response = await axios.get(
          `/api/combine?element1=${selectedElements[0]}&element2=${selectedElements[1]}`
        );

        const newElement = response.data;

        if (!newElement) {
          setError(true);
          setTimeout(() => setError(false), 3000);
          return;
        }

        const exists = elements.some((el) => el.name === newElement.name);
        if (!exists) {
          setElements((prev) => [
            ...prev,
            { name: newElement.name, emoji: newElement.emoji, isNew: true },
          ]);
          setElementList((prev) => [
            ...prev,
            { name: newElement.name, emoji: newElement.emoji, isNew: true },
          ]);

          if (popSound.current) {
            popSound.current.play();
          }

          localStorage.setItem(
            "elements",
            JSON.stringify([
              ...elements,
              { name: newElement.name, emoji: newElement.emoji },
            ])
          );

          setTimeout(() => {
            setElements((prev) =>
              prev.map((el) =>
                el.name === newElement.name ? { ...el, isNew: false } : el
              )
            );
            setElementList((prev) =>
              prev.map((el) =>
                el.name === newElement.name ? { ...el, isNew: false } : el
              )
            );
          }, 3000);
        }

        setTimeout(() => setSelectedElements([]), 300);
      } catch (error) {
        console.error("Error combining elements:", error);
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    }
  };

  useEffect(() => {
    const savedElements = localStorage.getItem("elements");
    if (savedElements) {
      setElements(JSON.parse(savedElements));
      setElementList(JSON.parse(savedElements));
    }
  }, []);

  useEffect(() => {
    createElement();
  }, [selectedElements]);

  return (
    <div className="relative min-w-screen min-h-screen pb-20 lg:pb-0">
      {/* Add `pb-20` to provide space for the sidebar in mobile mode */}
      <audio ref={popSound} src="/coin-flip-88793.mp3" preload="auto"></audio>

      <div className="flex">
        {/* Main Content Area */}
        <div className="flex flex-row gap-4 flex-wrap justify-center mt-5 w-full p-4">
          {elementList.map((element, index) => (
            <div
              key={index}
              className={twMerge(
                "relative bg-white shadow-md border border-gray-300 rounded-md p-3 gap-2 flex items-center justify-center cursor-pointer group transition duration-300 ease-in-out",
                deleteMode && markedForDeletion.includes(element.name)
                  ? "opacity-50 bg-red-100" // Highlight marked cards in delete mode
                  : ""
              )}
              onClick={() => handleClick(element.name)}
            >
              {/* Delete Button */}
              {deleteMode && (
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 z-20 hover:bg-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event propagation
                    handleClick(element.name);
                  }}
                >
                  ✕
                </button>
              )}

              {/* Hover Gradient Effect */}
              <div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-blue-400 to-transparent transition-all duration-300 ease-in-out group-hover:h-full z-[-1] pointer-events-none rounded-md"></div>

              {/* Content */}
              <span className="text-xl font-medium relative z-10">
                {element.emoji}
              </span>
              <span className="text-sm font-medium z-10 mt-1">
                {element.name}
              </span>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <Sidebar
          elements={elements}
          deleteMode={deleteMode}
          markedForDeletion={markedForDeletion}
          handleClick={handleClick}
        />
      </div>

      {/* Buttons */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        {/* Reset Button */}
        <button
          className="btn btn-ghost bg-gray-200 px-4 py-2 rounded shadow hover:bg-gray-300"
          onClick={clearElements}
        >
          Reset
        </button>

        {/* Delete Mode Toggle */}
        <button
          className={`btn px-4 py-2 rounded shadow ${
            deleteMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={toggleDeleteMode}
        >
          {deleteMode ? "Confirm Delete" : "Delete"}
        </button>

        {/* Delete Craft Button */}
        <button
          className="btn bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded shadow"
          onClick={deleteCraftCards}
        >
          Delete Craft
        </button>
      </div>

      {/* Error Notification */}
      {error && (
        <div
          role="alert"
          className="alert alert-error absolute bottom-4 left-1/2 transform -translate-x-1/2 max-w-md text-center"
        >
          <span>Error! Something went wrong when combining elements.</span>
        </div>
      )}
    </div>
  );
};

export default ElementList;
