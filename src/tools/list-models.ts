import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getModelsByCategory } from "../models/registry.js";

export function registerListModels(server: McpServer) {
  server.tool(
    "gaudio_list_models",
    "List available Gaudio AI models. Filter by category: 'stem' (instrument separation), 'dme' (dialogue/music/effects separation), 'text_sync' (lyrics sync).",
    {
      category: z
        .enum(["all", "stem", "dme", "text_sync"])
        .default("all")
        .describe("Filter by category: all (default), stem, dme, or text_sync"),
    },
    async ({ category }) => {
      const models = getModelsByCategory(category === "all" ? undefined : category);
      const formatted = models.map((m) => ({
        name: m.name,
        category: m.category,
        description: m.description,
        typeOptions: m.typeOptions ?? null,
        typeRequired: m.typeRequired,
        maxFileSize: m.maxFileSize,
        maxDuration: m.maxDuration,
        outputFormat: m.outputFormat,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formatted, null, 2),
          },
        ],
      };
    },
  );
}
