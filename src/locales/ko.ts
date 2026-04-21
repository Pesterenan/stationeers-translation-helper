import type { TranslationSchema } from "./index.ts";

export const ko: TranslationSchema = {
  app: {
    title: "Stationeers 번역 헬퍼",
    subtitle: "원본 게임 XML 파일을 가져오고, 번역을 편집한 후 새 XML을 내보냅니다",
    loading: "파일 처리 중...",
  },
  toolbar: {
    import: "XML / JSON 가져오기",
    settings: "프로젝트 설정",
    saveProgress: "진행 상황 저장",
    downloadXml: "XML 다운로드",
    searchPlaceholder: "검색",
    searchTooltip: "검색하려면 3글자 이상 입력하세요",
    showAccepted: "승인된 항목 표시",
    showEmpty: "비어 있는 항목 표시",
    totalProgress: "전체 진행 상황",
    draftSaved: "임시 저장 시간:",
  },
  dialogConfig: {
    title: "프로젝트 설정",
    description: "XML 파일 메타데이터 및 내보내기 설정을 조정합니다.",
    uiLanguageLabel: "인터페이스 언어",
    languageLabel: "언어 이름 (예: Portuguese)",
    codeLabel: "언어 코드 (예: pb)",
    fontLabel: "글꼴 (문자 집합)",
    exportFileLabel: "내보낼 파일 이름 (예: portuguese.xml)",
    exportFileHelper: "비어 있으면 언어에 따른 기본 이름이 사용됩니다.",
    resetProject: "프로젝트 초기화",
    cancel: "취소",
    save: "설정 저장",
  },
  dialogGoToPage: {
    title: "페이지 이동:",
    of: "/",
    cancel: "취소",
    go: "이동",
  },
  importer: {
    errorPrefix: "원본 게임 파일('english'로 시작) 또는 진행 상황 파일 'english_progress.json'만 허용됩니다.",
    errorUnknown: "알 수 없는 파일 형식입니다. .xml 또는 .json을 사용하세요",
  },
  messages: {
    xmlError: "XML 파싱 오류:",
    jsonError: "JSON 진행 상황 가져오기 오류:",
    exportError: "번역된 XML 생성 오류:",
    draftRecovered: "로컬 저장소에서 {lang} 임시 저장을 복구했습니다.",
    noXml: "불러온 XML 없음",
    confirmReset: "언어 설정과 불러온 파일이 지워집니다. 계속하시겠습니까?",
  },
  translationItem: {
    key: "키:",
    original: "원문:",
    translation: "번역:",
    actions: "작업:",
    tooltipTranslate: "자동 번역 (Alt+T)",
    tooltipCopy: "원문을 필드에 복사 (Ctrl+Shift+C)",
    tooltipAccept: "승인 (Ctrl/Cmd + Enter 또는 Ctrl+M)",
  }
};
