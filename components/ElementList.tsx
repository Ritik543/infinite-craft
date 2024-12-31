import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { Elements } from "@/Elements";
import axios from "axios";
import { twMerge } from "tailwind-merge";

const ElementList = () => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [elements, setElements] = useState(Elements); // Sidebar elements
  // const [elementList, setElementList] = useState(elements);
  const [elementList, setElementList] =
    useState<{ name: string; emoji: string; isNew?: boolean }[]>(Elements);

  const [deleteMode, setDeleteMode] = useState(false); // Toggle for delete mode
  const [markedForDeletion, setMarkedForDeletion] = useState<string[]>([]); // Cards marked for deletion
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const popSound = useRef<HTMLAudioElement | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false); // State for About Modal

  const handleClick = async (element: string) => {
    if (deleteMode) {
      setMarkedForDeletion((prev) =>
        prev.includes(element)
          ? prev.filter((name) => name !== element)
          : [...prev, element]
      );
    } else {
      if (selectedElements.length === 1) {
        const newElements = [selectedElements[0], element];
        setSelectedElements([]);

        await combineElements(newElements);
      } else {
        setSelectedElements([element]);
      }
    }
  };

  const handleSidebarClick = (elementName: string) => {
    const clickedElement = elements.find((el) => el.name === elementName);

    if (clickedElement) {
      setElementList((prev) => {
        if (!prev.some((el) => el.name === elementName)) {
          return [...prev, clickedElement]; // Add the clicked element to elementList
        }
        return prev; // Element already exists in elementList
      });
    }
  };

  const handleDragStart = (element: string) => {
    setDraggedElement(element);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Allow the drop
  };

  const handleDrop = async (targetElement: string) => {
    if (draggedElement && draggedElement !== targetElement) {
      const newElements = [draggedElement, targetElement];
      setDraggedElement(null);

      await combineElements(newElements);
    }
  };

  const combineElements = async (selectedElements: string[]) => {
    try {
      const response = await axios.get(
        `/api/combine?element1=${selectedElements[0]}&element2=${selectedElements[1]}`
      );

      const newElement = response.data;

      const existsInSidebar = elements.some(
        (el) => el.name === newElement.name
      );
      const existsInElementList = elementList.some(
        (el) => el.name === newElement.name
      );

      // Add the new card to both Sidebar and ElementList if not already present
      if (!existsInSidebar) {
        setElements((prev) => [
          ...prev,
          { name: newElement.name, emoji: newElement.emoji, isNew: true },
        ]);
      }

      if (!existsInElementList) {
        setElementList((prev) => {
          // Remove combined elements from elementList and add the new element
          return prev
            .filter((el) => !selectedElements.includes(el.name)) // Filter out the selected elements
            .concat({
              name: newElement.name,
              emoji: newElement.emoji,
              isNew: true, // Add the new element
            });
        });
      }

      if (popSound.current) {
        popSound.current.play();
      }

      // Save updated elements to localStorage
      localStorage.setItem(
        "elements",
        JSON.stringify([
          ...elements,
          { name: newElement.name, emoji: newElement.emoji },
        ])
      );

      // Remove the "isNew" flag after a delay
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
    } catch (error) {
      console.error("Error combining elements:", error);
    }
  };

  useEffect(() => {
    const savedElements = localStorage.getItem("elements");
    if (savedElements) {
      setElements(JSON.parse(savedElements));
      setElementList(JSON.parse(savedElements));
    }
  }, []);

  return (
    <div className="relative min-w-screen min-h-screen">
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
                  ? "opacity-50 bg-red-100"
                  : ""
              )}
              draggable
              onDragStart={() => handleDragStart(element.name)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(element.name)}
              onClick={(e) => {
                e.preventDefault(); // Prevent dragging conflict
                handleClick(element.name);
              }}
            >
              {deleteMode && (
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 z-20 hover:bg-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(element.name);
                  }}
                >
                  ✕
                </button>
              )}

              <div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-blue-400 to-transparent transition-all duration-300 ease-in-out group-hover:h-full z-[-1] pointer-events-none rounded-md"></div>

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
          handleClick={handleSidebarClick}
        />
      </div>

      {/* Sticky Footer Overlay */}
      <div className="fixed bottom-0 left-0 w-[90vw] lg:w-[80vw] bg-white shadow-md py-3 px-4 flex gap-4 justify-between items-center z-50">
        <button
          className="btn btn-ghost bg-gray-200 px-4 py-2 rounded shadow hover:bg-gray-300"
          onClick={() => {
            setElements(Elements);
            setElementList(Elements);
            localStorage.setItem("elements", JSON.stringify(Elements));
          }}
        >
          Reset
        </button>
        <button
          className={`btn px-4 py-2 rounded shadow ${
            deleteMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => {
            setDeleteMode((prev) => !prev);
            if (deleteMode) {
              const remainingElements = elementList.filter(
                (el) => !markedForDeletion.includes(el.name)
              );
              setElementList(remainingElements);
              setElements(elements); // Preserve sidebar elements
              setMarkedForDeletion([]);
            }
          }}
        >
          {deleteMode ? "Confirm Delete" : "Delete"}
        </button>
        <button
          className="btn bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded shadow"
          onClick={() => setElementList([])}
        >
          Delete Craft
        </button>
        <button
          className="btn bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded shadow"
          onClick={() => setShowAboutModal(true)}
        >
          About
        </button>
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 mb-4">Created by WebTreta</p>
            <button
              className="btn bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
              onClick={() => setShowAboutModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementList;
