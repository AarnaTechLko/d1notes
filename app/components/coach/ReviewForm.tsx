import type { Metadata } from "next";
import React from "react";
import PlayerSearchPage from "../individuals/Playerindividual";
// import Map from "../individuals/Map";


export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Playerdata() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7 w-[1000px]">
     <PlayerSearchPage/>
      {/* <Map/> */}
      </div>

    </div>
  );
}