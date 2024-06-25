import * as vscode from "vscode";
import { Client } from "pg";
import * as path from "path";
import * as fs from "fs";

let isConnected: boolean = false;
const configPath = path.resolve(__dirname, "../../../config.json");

async function createClient(): Promise<Client | null> {
  let connectionString = process.env.PG_CONNECTION_STRING;

  if (!connectionString) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      connectionString = config.PG_CONNECTION_STRING;
    } catch (error) {
      console.error(
        "Error reading PG_CONNECTION_STRING from config file:",
        error
      );
      vscode.window.showErrorMessage(
        "Error reading PG_CONNECTION_STRING from config file."
      );
    }
  }

  if (!connectionString) {
    vscode.window.showErrorMessage(
      "PostgreSQL connection string is not set in environment variables or config file."
    );
    return null;
  }

  const newClient = new Client({ connectionString });
  return newClient;
}

export async function connectToPostgres() {
  let client: Client | null = null;
  try {
    client = await createClient();
    if (client) {
      await client.connect();
      isConnected = true;
      vscode.window.showInformationMessage(
        "Initial connection to PostgreSQL database successful."
      );
    }
  } catch (error: any) {
    isConnected = false;
    vscode.window.showErrorMessage(
      "Failed to connect to PostgreSQL database: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
  return client;
}
