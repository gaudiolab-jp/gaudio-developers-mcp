import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";
import { getModel } from "../models/registry.js";

export function registerGetJob(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_get_job",
    "Check job status and get results. Status: 'waiting' (queued), 'running' (processing), 'success' (done, downloadUrl included), 'failed' (error). Download URLs expire after 48 hours.",
    {
      jobId: z.string().describe("Job ID from gaudio_create_job or gaudio_separate_audio"),
      model: z.string().describe("Model name used to create the job"),
    },
    async ({ jobId, model }) => {
      const modelInfo = getModel(model);
      if (!modelInfo) {
        return {
          content: [{ type: "text" as const, text: `Unknown model: ${model}` }],
          isError: true,
        };
      }

      const res = await client.getJob(model, jobId);
      const data = res.resultData ?? {};

      const result: Record<string, unknown> = {
        jobId,
        model,
        status: data.status,
      };

      if (data.status === "success") {
        result.downloadUrl = data.downloadUrl;
        result.expireAt = data.expireAt;
      } else if (data.status === "failed") {
        result.errorMessage = data.errorMessage;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );
}
