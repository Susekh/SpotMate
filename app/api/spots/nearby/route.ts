import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { SpotModel } from "@/lib/db/spot.model";
import { PipelineStage } from "mongoose";
import redis from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");
    const tagsParam = searchParams.get("tags");
    const q = (searchParams.get("q") || "").trim();
    const global = searchParams.get("global") === "1";
    const tags = tagsParam
      ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    // --- Build a cache key ---
    const cacheKey = `spots:${lat}:${lng}:${global}:${tags.join(",")}:${q}`;

    // --- 1. Check cache first ---
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // --- 2. Cache miss → connect DB ---
    await connectDB();

    const pipeline: PipelineStage[] = [];

    if (!global) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: 5000,
        },
      });
    } else {
      const EARTH_RADIUS_METERS = 6371000;
      pipeline.push({
        $addFields: {
          distanceMeters: {
            $multiply: [
              2,
              EARTH_RADIUS_METERS,
              {
                $asin: {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          {
                            $sin: {
                              $divide: [
                                {
                                  $subtract: [
                                    { $degreesToRadians: { $arrayElemAt: ["$location.coordinates", 1] } },
                                    { $degreesToRadians: lat },
                                  ],
                                },
                                2,
                              ],
                            },
                          },
                          2,
                        ],
                      },
                      {
                        $multiply: [
                          { $cos: { $degreesToRadians: lat } },
                          { $cos: { $degreesToRadians: { $arrayElemAt: ["$location.coordinates", 1] } } },
                          {
                            $pow: [
                              {
                                $sin: {
                                  $divide: [
                                    {
                                      $subtract: [
                                        { $degreesToRadians: { $arrayElemAt: ["$location.coordinates", 0] } },
                                        { $degreesToRadians: lng },
                                      ],
                                    },
                                    2,
                                  ],
                                },
                              },
                              2,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      });
    }

    if (tags.length) {
      pipeline.push({ $match: { tags: { $in: tags } } });
    }

    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { tags: { $elemMatch: { $regex: q, $options: "i" } } },
          ],
        },
      });
    }

    pipeline.push({
      $addFields: {
        distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] },
      },
    });

    if (q || tags.length) {
      pipeline.push({
        $addFields: {
          relevance: {
            $add: [
              q ? { $cond: [{ $regexMatch: { input: "$title", regex: q, options: "i" } }, 2, 0] } : 0,
              q ? { $cond: [{ $regexMatch: { input: "$description", regex: q, options: "i" } }, 1, 0] } : 0,
              tags.length ? { $size: { $setIntersection: ["$tags", tags] } } : 0,
            ],
          },
        },
      });
      pipeline.push({ $sort: { relevance: -1, distanceMeters: 1, createdAt: -1 } });
    } else if (!global) {
      pipeline.push({ $sort: { distanceMeters: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $limit: 20 });

    const spots = await SpotModel.aggregate(pipeline);
    const responseData = { spots };

    // --- 3. Save to cache with TTL ---
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
