"use client";

import { useState } from "react";
import { useMantineColorScheme } from "@mantine/core";
import { FiSun, FiMoon } from "react-icons/fi";

const DarkModeToggle = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [spinning, setSpinning] = useState(false);

  const handleToggle = () => {
    setSpinning(true);
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
    setTimeout(() => setSpinning(false), 400);
  };

  return (
    <>
      <style>{`
        @keyframes spin-icon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <button
        onClick={handleToggle}
        title="Toggle dark mode"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          padding: 0,
          display: "flex",
          alignItems: "center",
          height: 32,
          width: 32,
        }}
      >
        {colorScheme === "dark" ? (
          <FiSun
            size={32}
            style={{
              animation: spinning ? "spin-icon 0.4s ease forwards" : "none",
            }}
          />
        ) : (
          <FiMoon
            size={32}
            style={{
              animation: spinning ? "spin-icon 0.4s ease forwards" : "none",
            }}
          />
        )}
      </button>
    </>
  );
};

export default DarkModeToggle;
