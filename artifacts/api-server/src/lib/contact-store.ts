import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDirectory } from "./project-store";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  createdAt: string;
};

const messagesFile = path.join(dataDirectory, "contact-messages.json");
let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureMessagesFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(messagesFile, "utf8");
  } catch {
    await writeFile(messagesFile, "[]\n", { encoding: "utf8", flag: "wx" }).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "EEXIST") throw error;
    });
  }
}

export async function readContactMessages(): Promise<ContactMessage[]> {
  await ensureMessagesFile();
  return JSON.parse(await readFile(messagesFile, "utf8")) as ContactMessage[];
}

export async function addContactMessage(message: Omit<ContactMessage, "id" | "createdAt">) {
  await ensureMessagesFile();
  const nextWrite = writeQueue.then(async () => {
    const existing = JSON.parse(await readFile(messagesFile, "utf8")) as ContactMessage[];
    const created: ContactMessage = { ...message, id: randomUUID(), createdAt: new Date().toISOString() };
    const temporaryFile = `${messagesFile}.${randomUUID()}.tmp`;
    await writeFile(temporaryFile, JSON.stringify([created, ...existing].slice(0, 500), null, 2), "utf8");
    await rename(temporaryFile, messagesFile);
    return created;
  });
  writeQueue = nextWrite.catch(() => undefined);
  return nextWrite;
}
