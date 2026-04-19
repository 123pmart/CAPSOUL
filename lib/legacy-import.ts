import { promises as fs } from "fs";
import path from "path";

import { DATA_ROOT, resolvePublicPathToFile } from "@/lib/storage";

function isFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function readOptionalLegacyJson<T>(fileName: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_ROOT, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (
      (isFileSystemError(error) && error.code === "ENOENT") ||
      error instanceof SyntaxError
    ) {
      return null;
    }

    throw error;
  }
}

export async function readOptionalLegacyPublicFile(publicPath: string) {
  const filePath = resolvePublicPathToFile(publicPath);

  if (!filePath) {
    return null;
  }

  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (isFileSystemError(error) && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export function getFileNameFromPublicPath(publicPath: string) {
  return path.basename(publicPath);
}
