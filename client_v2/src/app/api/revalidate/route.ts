import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, tag, path } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET;
    // Enforce secret only if configured in environment
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { status: 0, message: "Invalid revalidation secret" },
        { status: 401 }
      );
    }

    if (!tag && !path) {
      return NextResponse.json(
        { status: 0, message: "Either 'tag' or 'path' must be provided in the request body" },
        { status: 400 }
      );
    }

    const revalidatedItems: { tag?: string; path?: string } = {};

    if (tag) {
      // In Next.js 16, revalidateTag accepts a second argument for expiration profile or config
      revalidateTag(tag, { expire: 0 });
      revalidatedItems.tag = tag;
    }

    if (path) {
      revalidatePath(path);
      revalidatedItems.path = path;
    }

    return NextResponse.json({
      status: 1,
      message: "Cache revalidation successful",
      revalidated: revalidatedItems,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 0, message: "Internal server error during revalidation", error: error?.message },
      { status: 500 }
    );
  }
}
