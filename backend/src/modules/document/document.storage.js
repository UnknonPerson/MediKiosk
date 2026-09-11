import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import ApiError from "../../utils/ApiError.js";

function getResolvedStoragePath(uploadDirectory, storageKey) {
  const baseDirectory = path.resolve(uploadDirectory);
  const resolvedPath = path.resolve(baseDirectory, storageKey);

  if (!resolvedPath.startsWith(`${baseDirectory}${path.sep}`)) {
    throw new ApiError(500, "Document storage could not be prepared.");
  }

  return resolvedPath;
}

export function createLocalDocumentStorage({ uploadDirectory }) {
  return {
    async save(storageKey, buffer) {
      const storagePath = getResolvedStoragePath(uploadDirectory, storageKey);

      await mkdir(path.dirname(storagePath), { recursive: true });
      await writeFile(storagePath, buffer, { flag: "wx" });
    },

    async remove(storageKey) {
      const storagePath = getResolvedStoragePath(uploadDirectory, storageKey);

      try {
        await unlink(storagePath);
      } catch (error) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }
    },
  };
}
