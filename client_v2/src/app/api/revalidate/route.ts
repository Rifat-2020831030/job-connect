import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, tag, path } = body;

    const expectedSecret = process.env.REVALIDATE_SECRET;
    // Strict enforcement: secret must be configured in environment and match request
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { status: 0, message: "Invalid or missing revalidation secret" },
        { status: 401 }
      );
    }

    // Extract tags (support single 'tag' or 'tags' array)
    const rawTags: string[] = [];
    if (typeof tag === "string" && tag.trim()) {
      rawTags.push(tag.trim());
    }
    if (Array.isArray(body.tags)) {
      body.tags.forEach((t: unknown) => {
        if (typeof t === "string" && t.trim()) rawTags.push(t.trim());
      });
    }
    const tags = Array.from(new Set(rawTags));

    // Extract paths (support single 'path' or 'paths' array)
    const rawPaths: string[] = [];
    if (typeof path === "string" && path.trim()) {
      rawPaths.push(path.trim());
    }
    if (Array.isArray(body.paths)) {
      body.paths.forEach((p: unknown) => {
        if (typeof p === "string" && p.trim()) rawPaths.push(p.trim());
      });
    }
    const paths = Array.from(new Set(rawPaths));

    if (tags.length === 0 && paths.length === 0) {
      return NextResponse.json(
        {
          status: 0,
          message: "Either 'tag(s)' or 'path(s)' must be provided in the request body",
        },
        { status: 400 }
      );
    }

    // Purge tagged fetch caches
    for (const t of tags) {
      revalidateTag(t, { expire: 0 });
    }

    // Purge route caches
    for (const p of paths) {
      revalidatePath(p);
    }

    return NextResponse.json({
      status: 1,
      message: "Cache revalidation successful",
      revalidated: { tags, paths },
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 0,
        message: "Internal server error during revalidation",
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
