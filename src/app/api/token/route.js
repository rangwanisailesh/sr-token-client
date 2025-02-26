import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
dotenv.config();

export async function POST(req) {

    try {

        const body = await req.json();
        const { pvtkey, address } = body;

        const token = jwt.sign({ pvtkey: pvtkey, address: address }, process.env.VERIFY);

        return NextResponse.json({ token: token });
    } catch (err) {
        return NextResponse.json({ error: err.message, err });
    }
}