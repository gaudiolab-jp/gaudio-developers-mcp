import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";
import { getModel } from "../models/registry.js";
import { pollJob } from "../utils/polling.js";

export function registerSeparateAudio(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_separate_audio",
    "All-in-one audio separation: upload file (or reuse uploadId) → create job → poll until done → return download URLs. For Stem Separation, provide 'type' (e.g. 'vocal', 'vocal,drum'). For DME Separation, no type needed. Supports WAV, FLAC, MP3, M4A, MOV, MP4.",
    {
      filePath: z
        .string()
        .optional()
        .describe("Path to local audio/video file. Either filePath or uploadId is required."),
      uploadId: z
        .string()
        .optional()
        .describe("Existing uploadId to reuse (skips upload). Valid for 72 hours."),
      model: z.string().describe("Model name (e.g. gsep_music_hq_v1, gsep_dme_dtrack_v1)"),
      type: z
        .string()
        .optional()
        .describe("Stem type(s) for Stem Separation models. e.g. 'vocal', 'vocal,drum'"),
      pollInterval: z
        .number()
        .optional()
        .default(10)
        .describe("Polling interval in seconds (default: 10)"),
    },
    async ({ filePath, uploadId, model, type, pollInterval }) => {
      const modelInfo = getModel(model);
      if (!modelInfo) {
        return {
          content: [{ type: "text" as const, text: `Unknown model: ${model}. Use gaudio_list_models to see available models.` }],
          isError: true,
        };
      }

      if (!filePath && !uploadId) {
        return {
          content: [{ type: "text" as const, text: "Either filePath or uploadId is required." }],
          isError: true,
        };
      }

      if (modelInfo.typeRequired && !type) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Model ${model} requires 'type'. Options: ${modelInfo.typeOptions?.join(", ")}`,
            },
          ],
          isError: true,
        };
      }

      if (modelInfo.category === "text_sync") {
        return {
          content: [{ type: "text" as const, text: "For Text Sync, use gaudio_sync_lyrics instead." }],
          isError: true,
        };
      }

      const messages: string[] = [];
      const log = (msg: string) => messages.push(msg);

      // Step 1: Upload if needed
      let resolvedUploadId = uploadId;
      if (!resolvedUploadId) {
        log("업로드 중...");
        const result = await client.uploadFile(filePath!);
        resolvedUploadId = result.uploadId;
        log(`업로드 완료. uploadId: ${resolvedUploadId}`);
      } else {
        log(`기존 uploadId 재사용: ${resolvedUploadId}`);
      }

      // Step 2: Create job
      const params: Record<string, unknown> = {
        audioUploadId: resolvedUploadId,
      };
      if (type) params.type = type;

      const { jobId } = await client.createJob(model, params);
      log(`Job 생성 완료. jobId: ${jobId}`);

      // Step 3: Poll
      const intervalMs = (pollInterval ?? 10) * 1000;
      const result = await pollJob(client, model, jobId, intervalMs, 30, log);

      const output: Record<string, unknown> = {
        jobId: result.jobId,
        status: result.status,
        uploadId: resolvedUploadId,
        model,
      };

      if (result.downloadUrl) output.downloadUrl = result.downloadUrl;
      if (result.expireAt) output.expireAt = result.expireAt;
      if (result.errorMessage) output.errorMessage = result.errorMessage;

      messages.push(JSON.stringify(output, null, 2));

      return {
        content: [
          {
            type: "text" as const,
            text: messages.join("\n"),
          },
        ],
      };
    },
  );
}
