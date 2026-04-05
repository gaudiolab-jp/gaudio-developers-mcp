import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";
import { GaudioApiError, getResultCodeMessage, getHttpErrorMessage } from "../utils/errors.js";

const BASE_URL = "https://restapi.gaudiolab.io/developers/api/v1";
const RATE_LIMIT_WAIT_MS = 61_000;
const MAX_RETRIES = 2;

export interface ApiResponse {
  resultCode: number;
  resultData?: Record<string, unknown>;
}

export class GaudioClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse> {
    const url = `${BASE_URL}${path}`;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const response = await fetch(url, {
        method,
        headers: {
          "x-ga-apikey": this.apiKey,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 429) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
          continue;
        }
        throw new GaudioApiError(getHttpErrorMessage(429), 429);
      }

      if (!response.ok) {
        throw new GaudioApiError(
          getHttpErrorMessage(response.status),
          response.status,
        );
      }

      const data = (await response.json()) as ApiResponse;

      if (data.resultCode !== 1000) {
        throw new GaudioApiError(
          getResultCodeMessage(data.resultCode),
          200,
          data.resultCode,
        );
      }

      return data;
    }

    throw new GaudioApiError("Max retries exceeded");
  }

  async uploadCreate(
    fileName: string,
    fileSize: number,
  ): Promise<{
    uploadId: string;
    chunkSize: number;
    preSignedUrl: string[];
  }> {
    const res = await this.request("POST", "/files/upload-multipart/create", {
      fileName,
      fileSize,
    });
    return res.resultData as {
      uploadId: string;
      chunkSize: number;
      preSignedUrl: string[];
    };
  }

  async uploadChunk(
    presignedUrl: string,
    chunk: Uint8Array,
    contentType: string,
  ): Promise<string> {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: chunk as unknown as BodyInit,
    });

    if (!response.ok) {
      throw new GaudioApiError(
        `Chunk upload failed: ${response.status}`,
        response.status,
      );
    }

    const etag = response.headers.get("ETag");
    if (!etag) {
      throw new GaudioApiError("ETag header missing from chunk upload response");
    }
    return etag.replace(/"/g, "");
  }

  async uploadComplete(
    uploadId: string,
    parts: { awsETag: string; partNumber: number }[],
  ): Promise<void> {
    await this.request("POST", "/files/upload-multipart/complete", {
      uploadId,
      parts,
    });
  }

  async uploadFile(filePath: string): Promise<{ uploadId: string }> {
    const stat = statSync(filePath);
    const fileName = basename(filePath);
    const fileSize = stat.size;
    const fileBuffer = readFileSync(filePath);

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const contentTypeMap: Record<string, string> = {
      wav: "audio/wav",
      flac: "audio/flac",
      mp3: "audio/mpeg",
      m4a: "audio/mp4",
      mov: "video/quicktime",
      mp4: "video/mp4",
      txt: "text/plain",
    };
    const contentType = contentTypeMap[ext] ?? "application/octet-stream";

    const { uploadId, chunkSize, preSignedUrl } = await this.uploadCreate(
      fileName,
      fileSize,
    );

    const parts: { awsETag: string; partNumber: number }[] = [];

    for (let i = 0; i < preSignedUrl.length; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = fileBuffer.subarray(start, end);

      const etag = await this.uploadChunk(preSignedUrl[i], new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength), contentType);
      parts.push({ awsETag: etag, partNumber: i + 1 });
    }

    parts.sort((a, b) => a.partNumber - b.partNumber);
    await this.uploadComplete(uploadId, parts);

    return { uploadId };
  }

  async createJob(
    model: string,
    params: Record<string, unknown>,
  ): Promise<{ jobId: string }> {
    const res = await this.request("POST", `/${model}/jobs`, params);
    return { jobId: res.resultData?.jobId as string };
  }

  async getJob(model: string, jobId: string): Promise<ApiResponse> {
    return this.request("GET", `/${model}/jobs/${jobId}`);
  }

  async getKeyInfo(): Promise<ApiResponse> {
    return this.request("GET", "/key/info");
  }
}
