import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";
import { getModel } from "../models/registry.js";

export function registerCreateJob(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_create_job",
    "Create a processing job with an uploaded file. For Stem Separation models (gsep_music_hq_v1, gsep_music_shq_v1, gsep_speech_hq_v1), the 'type' parameter is required (e.g. 'vocal', 'vocal,drum'). For DME models, no type is needed. For Text Sync (gts_lyrics_line_v1), use gaudio_sync_lyrics instead.",
    {
      uploadId: z.string().describe("Upload ID from gaudio_upload_file (used as audioUploadId)"),
      model: z.string().describe("Model name (e.g. gsep_music_hq_v1, gsep_dme_dtrack_v1)"),
      type: z
        .string()
        .optional()
        .describe("Stem type(s), comma-separated. Required for Stem Separation models. e.g. 'vocal', 'vocal,drum,bass'"),
    },
    async ({ uploadId, model, type }) => {
      const modelInfo = getModel(model);
      if (!modelInfo) {
        return {
          content: [{ type: "text" as const, text: `Unknown model: ${model}. Use gaudio_list_models to see available models.` }],
          isError: true,
        };
      }

      if (modelInfo.typeRequired && !type) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Model ${model} requires a 'type' parameter. Options: ${modelInfo.typeOptions?.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      const params: Record<string, unknown> = { audioUploadId: uploadId };
      if (type) params.type = type;

      const { jobId } = await client.createJob(model, params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ jobId, model, status: "created" }, null, 2),
          },
        ],
      };
    },
  );
}
