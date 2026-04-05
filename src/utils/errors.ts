const RESULT_CODE_MESSAGES: Record<number, string> = {
  1007: "지정한 언어가 텍스트 내용과 일치하지 않습니다.",
  1008: "텍스트는 최소 2줄 이상 포함해야 합니다.",
  1014: "지원하지 않는 샘플레이트입니다. 16kHz ~ 192kHz를 사용하세요.",
  1015: "지원하지 않는 채널입니다. 모노(1ch) 또는 스테레오(2ch)를 사용하세요.",
  1100: "알 수 없는 오류가 발생했습니다. 지속되면 Gaudio 고객지원에 문의하세요.",
  1102: "크레딧이 부족합니다. Gaudio 대시보드에서 충전하세요.",
  1103: "계약이 유효하지 않거나 만료되었습니다.",
  1104: "요청한 Job을 찾을 수 없습니다.",
  1105: "업로드 ID를 찾을 수 없습니다. 파일을 다시 업로드해주세요.",
  1106: "업로드 ID가 만료되었습니다 (72시간). 파일을 다시 업로드해주세요.",
  1107: "지원하지 않는 파일 형식입니다. WAV, FLAC, MP3, M4A, MOV, MP4를 사용하세요.",
  1108: "오디오 길이가 0초입니다. 파일을 확인하세요.",
  1109: "오디오 길이가 허용 한도를 초과했습니다.",
  1110: "파일 크기가 허용 한도를 초과했습니다.",
  1111: "지원하지 않는 언어입니다. en, ko, ja, zh-cn 중 선택하세요.",
  1112: "지원하지 않는 텍스트 형식입니다. .txt 파일을 사용하세요.",
  1113: "지원하지 않는 파일명 형식입니다.",
  1114: "프로젝트가 삭제되었습니다.",
  1122: "필수 파라미터 'type'이 누락되었습니다.",
};

const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "API 키가 요청 헤더에 없습니다. GAUDIO_API_KEY 환경변수를 확인하세요.",
  401: "API 키가 유효하지 않습니다. 대시보드에서 키를 확인하세요.",
  403: "이 API 키로 해당 모델에 접근할 수 없습니다. 프로젝트 설정을 확인하세요.",
  405: "해당 모델은 현재 사용할 수 없습니다. 다른 모델을 사용하세요.",
  429: "요청이 너무 많습니다. 60초 후 자동 재시도합니다.",
};

export class GaudioApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly resultCode?: number,
  ) {
    super(message);
    this.name = "GaudioApiError";
  }
}

export function getResultCodeMessage(code: number): string {
  return RESULT_CODE_MESSAGES[code] ?? `알 수 없는 오류 (resultCode: ${code})`;
}

export function getHttpErrorMessage(status: number): string {
  if (status >= 500) {
    return "Gaudio 서버에 일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  return HTTP_ERROR_MESSAGES[status] ?? `HTTP 오류 (${status})`;
}
