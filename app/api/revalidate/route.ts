import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (REVALIDATE_SECRET && token !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string; path?: string; type?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { slug, path, type } = body;

  try {
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path });
    }

    if (slug && type) {
      const paths: Record<string, string> = {
        post: `/${slug}`,
        category: `/category/${slug}`,
        tag: `/tag/${slug}`,
        author: `/author/${slug}`,
        page: `/${slug}`,
      };

      const targetPath = paths[type];
      if (targetPath) {
        revalidatePath(targetPath);
        // Also revalidate home and listing pages
        revalidatePath("/");
        if (type === "post") {
          revalidatePath("/feed.xml");
          revalidatePath("/feed.json");
          revalidatePath("/sitemap.xml");
        }
        return NextResponse.json({ revalidated: true, path: targetPath, type });
      }
    }

    // Revalidate everything
    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, all: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Revalidation failed", details: String(error) },
      { status: 500 }
    );
  }
}
