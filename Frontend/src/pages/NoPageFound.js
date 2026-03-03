import React from "react";
import { Link } from "react-router-dom";

function NoPageFound() {
  return (
    <div className="grid h-screen px-4 bg-white place-content-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <p className="mt-4 text-gray-500">We can&apos;t find that page.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NoPageFound;
