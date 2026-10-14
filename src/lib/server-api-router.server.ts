import fs from "fs/promises";
import path from "path";
import {
  serverSignUp,
  serverSignIn,
  serverGetUser,
  serverUpdatePassword,
} from "./mysql-auth.server";
import {
  executeMysqlQuery,
  executeMysqlRpc,
  saveUploadedFile,
} from "./mysql-api.server";

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".json":
      return "application/json";
    case ".zip":
      return "application/zip";
    case ".txt":
      return "text/plain";
    default:
      return "application/octet-stream";
  }
}

export async function handleMysqlServerApi(request: Request, url: URL): Promise<Response | null> {
  const pathname = url.pathname;

  // 1. Static Uploads Serving (/uploads/*)
  if (pathname.startsWith("/uploads/")) {
    try {
      const relPath = pathname.replace(/^\/uploads\//, "");
      const fullPath = path.resolve(process.cwd(), "public", "uploads", relPath);
      const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");

      if (!fullPath.startsWith(uploadsRoot)) {
        return new Response("Forbidden", { status: 403 });
      }

      const fileBuffer = await fs.readFile(fullPath);
      const contentType = getMimeType(fullPath);

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  // 2. Auth: Sign In
  if (pathname === "/api/auth/signin" && request.method === "POST") {
    try {
      const body = await request.json();
      const res = await serverSignIn(body.email, body.password);
      return Response.json(res, { status: res.error ? 400 : 200 });
    } catch (err: any) {
      return Response.json({ user: null, session: null, error: err.message }, { status: 500 });
    }
  }

  // 3. Auth: Sign Up
  if (pathname === "/api/auth/signup" && request.method === "POST") {
    try {
      const body = await request.json();
      const fullName = body.options?.data?.full_name || body.fullName || body.name;
      const res = await serverSignUp(body.email, body.password, fullName);
      return Response.json(res, { status: res.error ? 400 : 200 });
    } catch (err: any) {
      return Response.json({ user: null, session: null, error: err.message }, { status: 500 });
    }
  }

  // 4. Auth: Get User (Session validation)
  if (pathname === "/api/auth/user" && request.method === "GET") {
    try {
      const authHeader = request.headers.get("authorization") || "";
      const res = await serverGetUser(authHeader);
      return Response.json(res, { status: res.error ? 401 : 200 });
    } catch (err: any) {
      return Response.json({ user: null, error: err.message }, { status: 500 });
    }
  }

  // 5. Auth: Sign Out
  if (pathname === "/api/auth/signout" && request.method === "POST") {
    return Response.json({ error: null }, { status: 200 });
  }

  // 6. Auth: Update Password
  if (pathname === "/api/auth/update-password" && request.method === "POST") {
    try {
      const authHeader = request.headers.get("authorization") || "";
      const userRes = await serverGetUser(authHeader);
      if (!userRes.user) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const body = await request.json();
      const res = await serverUpdatePassword(userRes.user.id, body.password);
      return Response.json(res, { status: res.error ? 400 : 200 });
    } catch (err: any) {
      return Response.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  // 7. Generic Data Query (/api/data)
  if (pathname === "/api/data" && request.method === "POST") {
    try {
      const body = await request.json();
      const res = await executeMysqlQuery(body);
      return Response.json(res, { status: res.error ? 400 : 200 });
    } catch (err: any) {
      return Response.json({ data: null, error: { message: err.message } }, { status: 500 });
    }
  }

  // 8. Stored Procedures / RPC (/api/rpc)
  if (pathname.startsWith("/api/rpc/")) {
    try {
      const fnName = pathname.replace(/^\/api\/rpc\//, "");
      const params = request.method === "POST" ? await request.json() : {};
      const res = await executeMysqlRpc(fnName, params);
      return Response.json(res, { status: res.error ? 400 : 200 });
    } catch (err: any) {
      return Response.json({ data: null, error: { message: err.message } }, { status: 500 });
    }
  }

  // 9. Storage Upload (/api/storage/upload)
  if (pathname === "/api/storage/upload" && request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const bucket = String(formData.get("bucket") || "uploads");
        const relPath = String(formData.get("path") || crypto.randomUUID());
        const file = formData.get("file");

        if (!file || !(file instanceof Blob)) {
          return Response.json({ data: null, error: { message: "No file provided" } }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const saved = await saveUploadedFile(bucket, relPath, buffer);
        return Response.json({ data: saved, error: null });
      }

      // Raw body upload with bucket and path in headers
      const bucket = request.headers.get("x-bucket") || "uploads";
      const relPath = request.headers.get("x-path") || crypto.randomUUID();
      const buffer = Buffer.from(await request.arrayBuffer());
      const saved = await saveUploadedFile(bucket, relPath, buffer);
      return Response.json({ data: saved, error: null });
    } catch (err: any) {
      console.error("[Storage Upload Error]:", err);
      return Response.json({ data: null, error: { message: err.message } }, { status: 500 });
    }
  }

  return null;
}
