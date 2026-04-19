import { promises as fs } from "fs";
import path from "path";

export const DATA_ROOT = path.join(process.cwd(), "data");
export const PUBLIC_ROOT = path.join(process.cwd(), "public");
export const MEDIA_UPLOAD_ROOT = path.join(PUBLIC_ROOT, "media-uploads");

function isFileSystemError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string, fallbackValue: T): Promise<T> {
  await ensureDir(path.dirname(filePath));

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (
      (isFileSystemError(error) && error.code === "ENOENT") ||
      error instanceof SyntaxError
    ) {
      await writeJsonFile(filePath, fallbackValue);
      return fallbackValue;
    }

    throw error;
  }
}

export async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureDir(path.dirname(filePath));

  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(tempPath, filePath);
}

export function toPublicMediaPath(fileName: string) {
  return `/media-uploads/${fileName}`;
}

export function resolvePublicPathToFile(publicPath: string) {
  if (!publicPath.startsWith("/")) {
    return null;
  }

  return path.join(PUBLIC_ROOT, publicPath.replace(/^\//, ""));
}
