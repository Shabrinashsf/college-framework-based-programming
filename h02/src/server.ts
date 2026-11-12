import http from "node:http";
import url from "node:url";
import Database from "better-sqlite3";
import path from "node:path";

// Database setup
const dbPath = path.join(process.cwd(), "users.db");
let db: Database.Database;

// Initialize database
const initDatabase = () => {
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      isAdmin BOOLEAN NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_name
    ON users(name);

    CREATE INDEX IF NOT EXISTS idx_users_createdAt
    ON users(createdAt);
  `);
};

type User = {
  id: number;
  name: string;
  age: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

// helper 
const toUser = (row: any): User => ({
  ...row,
  isAdmin: row.isAdmin === 1
});

const sendJson = (res: http.ServerResponse, status: number, data: unknown) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const parseId = (pathname: string): number | null => {
  const idStr = pathname.split("/")[2];
  if (!idStr || !/^\d+$/.test(idStr)) return null;
  return Number(idStr);
};

const readBody = (req: http.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

// validation
type ValidUserInput = { name: string; age: number; isAdmin: boolean };

const validateUser = (
  data: any
): { errors: string[]; value?: ValidUserInput } => {
  if (data === undefined || data === null || typeof data !== "object") {
    return { errors: ["Request body is required"] };
  }

  const errors: string[] = [];

  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (name === "") {
    errors.push("Name is required and must be a non-empty string");
  } else if (name.length > 100) {
    errors.push("Name must be 100 characters or less");
  }

  if (data.age === undefined || data.age === null) {
    errors.push("Age is required");
  } else if (
    typeof data.age !== "number" ||
    !Number.isInteger(data.age) ||
    data.age < 0 ||
    data.age > 150
  ) {
    errors.push("Age must be a valid integer between 0 and 150");
  }

  if (data.isAdmin !== undefined && typeof data.isAdmin !== "boolean") {
    errors.push("isAdmin must be a boolean value");
  }

  if (errors.length > 0) return { errors };
  return {
    errors: [],
    value: { name, age: data.age, isAdmin: data.isAdmin ?? false },
  };
};

export const createMyServer = (): http.Server => {
  // Initialize database when server is created
  initDatabase();

  const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    const parsedUrl = url.parse(req.url!, true);
    const pathname = parsedUrl.pathname ?? "";
    const method = req.method;

    try {
      if (method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      if (method === "GET" && pathname === "/users") {
        const rows = db.prepare("SELECT * FROM users ORDER BY id").all();
        sendJson(res, 200, rows.map(toUser));
        return;
      }

      if (method === "GET" && pathname.startsWith("/users/")) {
        const id = parseId(pathname);
        if (id === null) return sendJson(res, 400, { error: "Invalid user ID" });

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if (!row) return sendJson(res, 404, { error: "User not found" });

        sendJson(res, 200, toUser(row));
        return;
      }

      if (method === "POST" && pathname === "/users") {
        const body = await readBody(req);

        let data: any;
        try {
          data = body ? JSON.parse(body) : undefined;
        } catch {
          return sendJson(res, 400, { error: "Invalid JSON" });
        }

        const { errors, value } = validateUser(data);
        if (!value) {
          return sendJson(res, 400, { error: "Validation failed", details: errors });
        }

        const now = new Date().toISOString();
        const result = db
          .prepare(
            "INSERT INTO users (name, age, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
          )
          .run(value.name, value.age, value.isAdmin ? 1 : 0, now, now);

        const row = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(result.lastInsertRowid);
        sendJson(res, 201, toUser(row));
        return;
      }

      if (method === "PUT" && pathname.startsWith("/users/")) {
        const id = parseId(pathname);
        if (id === null) return sendJson(res, 400, { error: "Invalid user ID" });

        const body = await readBody(req);

        let data: any;
        try {
          data = body ? JSON.parse(body) : undefined;
        } catch {
          return sendJson(res, 400, { error: "Invalid JSON" });
        }

        const { errors, value } = validateUser(data);
        if (!value) {
          return sendJson(res, 400, { error: "Validation failed", details: errors });
        }

        const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
        if (!existing) return sendJson(res, 404, { error: "User not found" });

        // Pastikan updatedAt pasti berbeda dari createdAt walau di milidetik yang sama
        let nowMs = Date.now();
        if (nowMs <= new Date(existing.createdAt).getTime()) {
          nowMs = new Date(existing.createdAt).getTime() + 1;
        }
        const now = new Date(nowMs).toISOString();

        db.prepare(
          "UPDATE users SET name = ?, age = ?, isAdmin = ?, updatedAt = ? WHERE id = ?"
        ).run(value.name, value.age, value.isAdmin ? 1 : 0, now, id);

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        sendJson(res, 200, toUser(row));
        return;
      }

      if (method === "DELETE" && pathname.startsWith("/users/")) {
        const id = parseId(pathname);
        if (id === null) return sendJson(res, 400, { error: "Invalid user ID" });

        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
        if (!row) return sendJson(res, 404, { error: "User not found" });

        db.prepare("DELETE FROM users WHERE id = ?").run(id);
        sendJson(res, 200, { message: "User deleted", user: toUser(row) });
        return;
      }

      // Route / method lain
      sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "Internal server error" });
    }
  });

  return server;
};

export const resetMyServerData = () => {
  try {
    if (db) {
      db.prepare("DELETE FROM users").run();
      db.prepare("DELETE FROM sqlite_sequence WHERE name = 'users'").run();
      console.log("Database reset completed");
    }
  } catch (error) {
    console.error("Error resetting database:", error);
  }
};

// Clean up database connection on process exit
process.on("exit", () => {
  if (db) {
    db.close();
  }
});

process.on("SIGINT", () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});

process.on("SIGTERM", () => {
  if (db) {
    db.close();
  }
  process.exit(0);
});
