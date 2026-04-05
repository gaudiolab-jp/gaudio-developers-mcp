import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";
import { pollJob } from "../utils/polling.js";

export function registerSyncLyrics(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_sync_lyrics",
    "All-in-one lyrics sync: upload audio + text files → create gts_lyrics_line_v1 job → poll → return CSV (timestamp, lyric_text, confidence_score) + JSON report URLs. Text file requirements: .txt format, UTF-8, minimum 2 lines, max 60 characters per line. Audio limit: 1GB / 10 minutes.",
    {
      audioFilePath: z
        .string()
        .optional()
        .describe("Path to local audio file. Either audioFilePath or audioUploadId required."),
      audioUploadId: z
        .string()
        .optional()
        .describe("Existing audio uploadId to reuse."),
      textFilePath: z
        .string()
        .optional()
        .describe("Path to local .txt lyrics file. Either textFilePath or textUploadId required."),
      textUploadId: z
        .string()
        .optional()
        .describe("Existing text uploadId to reuse."),
      language: z
        .enum(["en", "ko", "ja", "zh-cn"])
        .describe("Language of the lyrics: en (English), ko (Korean), ja (Japanese), zh-cn (Chinese Simplified)"),
      pollInterval: z
        .number()
        .optional()
        .default(10)
        .describe("Polling interval in seconds (default: 10)"),
    },
    async ({
      audioFilePath,
      audioUploadId,
      textFilePath,
      textUploadId,
      language,
      pollInterval,
    }) => {
      if (!audioFilePath && !audioUploadId) {
        return {
          content: [{ type: "text" as const, text: "Either audioFilePath or audioUploadId is required." }],
          isError: true,
        };
      }
      if (!textFilePath && !textUploadId) {
        return {
          content: [{ type: "text" as const, text: "Either textFilePath or textUploadId is required." }],
          isError: true,
        };
      }

      const messages: string[] = [];
      const log = (msg: string) => messages.push(msg);

      // Step 1: Upload audio if needed
      let resolvedAudioId = audioUploadId;
      if (!resolvedAudioId) {
        log("오디오 파일 업로드 중...");
        const res = await client.uploadFile(audioFilePath!);
        resolvedAudioId = res.uploadId;
        log(`오디오 업로드 완료. uploadId: ${resolvedAudioId}`);
      }

      // Step 2: Upload text if needed
      let resolvedTextId = textUploadId;
      if (!resolvedTextId) {
        log("텍스트 파일 업로드 중...");
        const res = await client.uploadFile(textFilePath!);
        resolvedTextId = res.uploadId;
        log(`텍스트 업로드 완료. uploadId: ${resolvedTextId}`);
      }

      // Step 3: Create job
      const model = "gts_lyrics_line_v1";
      const { jobId } = await client.createJob(model, {
        audioUploadId: resolvedAudioId,
        textUploadId: resolvedTextId,
        language,
      });
      log(`Job 생성 완료. jobId: ${jobId}`);

      // Step 4: Poll
      const intervalMs = (pollInterval ?? 10) * 1000;
      const result = await pollJob(client, model, jobId, intervalMs, 30, log);

      const output: Record<string, unknown> = {
        jobId: result.jobId,
        status: result.status,
        model,
        audioUploadId: resolvedAudioId,
        textUploadId: resolvedTextId,
        language,
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
