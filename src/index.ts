#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GaudioClient } from "./api/client.js";
import { registerListModels } from "./tools/list-models.js";
import { registerUploadFile } from "./tools/upload-file.js";
import { registerCreateJob } from "./tools/create-job.js";
import { registerGetJob } from "./tools/get-job.js";
import { registerSeparateAudio } from "./tools/separate-audio.js";
import { registerSyncLyrics } from "./tools/sync-lyrics.js";
import { registerGetKeyInfo } from "./tools/get-key-info.js";

const apiKey = process.env.GAUDIO_API_KEY;
if (!apiKey) {
  console.error("GAUDIO_API_KEY environment variable is required.");
  process.exit(1);
}

const server = new McpServer({
  name: "com.gaudiolab/mcp-developers",
  version: "1.0.0",
});

const client = new GaudioClient(apiKey);

registerListModels(server);
registerUploadFile(server, client);
registerCreateJob(server, client);
registerGetJob(server, client);
registerSeparateAudio(server, client);
registerSyncLyrics(server, client);
registerGetKeyInfo(server, client);

const transport = new StdioServerTransport();
await server.connect(transport);
