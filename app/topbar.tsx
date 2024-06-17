// components/Topbar.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import Locale from "./locales";

const Topbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">{Locale.Home.AppName}</div>
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Home.Title}</Link>
          <Link href="/settings" className="text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Settings.Title}</Link>
          <Link href="/activity" className="text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Activity.Title}</Link>
        </div>
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              ></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <Link onClick={handleLinkClick} href="/" className="block text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Home.Title}</Link>
          <Link onClick={handleLinkClick} href="/settings" className="block text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Settings.Title}</Link>
          <Link onClick={handleLinkClick} href="/activity" className="block text-white hover:bg-blue-700 px-3 py-2 rounded">{Locale.Activity.Title}</Link>
        </div>
      )}
    </nav>
  );
};

export default Topbar;
