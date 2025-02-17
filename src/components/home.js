'use client'
import { useState, useEffect } from "react"

import {
    barlow_condensed,
    barlow,
    poppins_bold,
    poppins_regular
} from "./fonts"

import { GiBearFace } from "react-icons/gi";

export const HomeComp = () => {
    return (
        <div className="bg-[#0a254d] w-full h-full min-h-[100vh]">

            <div className="contain px-5 text-white">

                {/* Nav */}
                <div className="w-full flex items-center my-auto py-5">

                    <div className="flex items-center my-auto space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-b from-sky-100 to-cyan-200 drop-shadow-lg">
                            <span className="flex justify-center items-center m-auto h-full">
                                <GiBearFace className="text-[#0a254d] h-6 w-6" />
                            </span>
                        </div>

                        <div className={`${barlow} text-3xl drop-shadow-lg`}>
                            SRT
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}