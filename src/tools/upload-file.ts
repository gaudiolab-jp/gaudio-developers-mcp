import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";

export function registerUploadFile(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_upload_file",
    "Upload a local audio/video/text file to Gaudio servers. Handles multipart upload automatically (create → chunk upload → complete). The returned uploadId is valid for 72 hours and can be reused across multiple jobs. Supported formats: WAV, FLAC, MP3, M4A, MOV, MP4, TXT.",
    {
      filePath: z
        .string()
        .describe("Absolute path to the local file to upload"),
    },
    async ({ filePath }) => {
      const { uploadId } = await client.uploadFile(filePath);

      const expiresAt = new Date(
        Date.now() + 72 * 60 * 60 * 1000,
      ).toISOString();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ uploadId, expiresAt }, null, 2),
          },
        ],
      };
    },
  );
}
