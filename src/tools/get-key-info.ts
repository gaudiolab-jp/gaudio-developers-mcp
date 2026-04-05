import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GaudioClient } from "../api/client.js";

export function registerGetKeyInfo(server: McpServer, client: GaudioClient) {
  server.tool(
    "gaudio_get_key_info",
    "Get API key information: description, creation date, status, permitted models, project name, and remaining credits (free + paid).",
    {},
    async () => {
      const res = await client.getKeyInfo();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.resultData, null, 2),
          },
        ],
      };
    },
  );
}
