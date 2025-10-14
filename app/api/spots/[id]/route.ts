import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { SpotModel } from "@/lib/db/spot.model";
import redis from "@/lib/redis";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const cacheKey = `spot:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return NextResponse.json({ spot: JSON.parse(cached), cached: true });
        }

        await connectDB();
        const spot = await SpotModel.findById(id).lean();
        if (!spot) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        await redis.set(cacheKey, JSON.stringify(spot), "EX", 60);
        return NextResponse.json({ spot, cached: false });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


