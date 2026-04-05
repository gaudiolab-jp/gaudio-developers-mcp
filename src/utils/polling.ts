import type { GaudioClient } from "../api/client.js";
import { GaudioApiError } from "./errors.js";

export interface PollResult {
  jobId: string;
  status: string;
  downloadUrl?: Record<string, unknown>;
  errorMessage?: string;
  expireAt?: string;
}

export async function pollJob(
  client: GaudioClient,
  model: string,
  jobId: string,
  intervalMs: number = 10_000,
  maxAttempts: number = 30,
  onProgress?: (message: string) => void,
): Promise<PollResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let result;
    try {
      result = await client.getJob(model, jobId);
    } catch (err) {
      if (err instanceof GaudioApiError) {
        return {
          jobId,
          status: "failed",
          errorMessage: err.message,
        };
      }
      throw err;
    }

    const status = result.resultData?.status as string;

    if (status === "success") {
      onProgress?.("처리 완료!");
      return {
        jobId,
        status: "success",
        downloadUrl: result.resultData?.downloadUrl as Record<string, unknown>,
        expireAt: result.resultData?.expireAt as string,
      };
    }

    if (status === "failed") {
      return {
        jobId,
        status: "failed",
        errorMessage: (result.resultData?.errorMessage as string) ?? "Job failed",
      };
    }

    if (attempt === 0) {
      onProgress?.("처리 대기 중...");
    } else {
      onProgress?.(`처리 중... (${attempt + 1}/${maxAttempts})`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    jobId,
    status: "polling_timeout",
    errorMessage: `${maxAttempts}회 폴링 후에도 미완료. gaudio_get_job으로 나중에 확인하세요. jobId: ${jobId}`,
  };
}
