import type { TranslationSchema } from "./index.ts";

export const ja: TranslationSchema = {
  app: {
    title: "Stationeers 翻訳ヘルパー",
    subtitle: "元のゲーム XML ファイルをインポートし、翻訳を編集して新しい XML をエクスポートします",
    loading: "ファイルを処理中...",
  },
  toolbar: {
    import: "XML / JSON インポート",
    settings: "設定",
    saveProgress: "進捗を保存",
    downloadXml: "XML ダウンロード",
    searchPlaceholder: "検索",
    searchTooltip: "検索するには3文字以上入力してください",
    showAccepted: "承認済みを表示",
    showEmpty: "空の項目を表示",
    totalProgress: "全体進捗",
    draftSaved: "下書き保存時刻:",
  },
  dialogConfig: {
    title: "設定",
    description: "アプリケーションの言語と言語のエクスポート設定を調整します。",
    uiLanguageLabel: "インターフェース言語",
    filePropertiesDescription: "エクスポートされたファイルの言語設定を調整します。",
    languageLabel: "言語名 (例: Portuguese)",
    codeLabel: "言語コード (例: pb)",
    fontLabel: "フォント (文字セット)",
    originalFileLabel: "マスターファイル（ドラフトID）",
    originalFileHelper: "これは翻訳ベースとして読み込まれたファイルの名前です。",
    exportFileLabel: "エクスポートファイル名",
    exportFileHelper: "空の場合、言語に基づいた名前になります。",
    resetProject: "プロジェクトをリセット",
    cancel: "キャンセル",
    save: "設定を保存",
  },
  dialogGoToPage: {
    title: "ページ移動:",
    of: "/",
    cancel: "キャンセル",
    go: "移動",
  },
  importer: {
    errorPrefix: "元のゲームファイル（'english' で始まるもの）または進捗ファイル 'english_progress.json' のみ許可されています。",
    errorUnknown: "不明なファイル形式です。.xml または .json を使用してください",
  },
  messages: {
    xmlError: "XML 解析エラー:",
    jsonError: "JSON 進捗インポートエラー:",
    exportError: "翻訳済み XML 生成エラー:",
    draftRecovered: "ローカルストレージから {lang} の下書きを復元しました。",
    noXml: "XML が読み込まれていません",
    confirmReset: "言語設定と読み込まれたファイルがクリアされます。続行しますか？",
  },
  translationItem: {
    key: "キー:",
    original: "原文:",
    translation: "翻訳:",
    actions: "操作:",
    tooltipTranslate: "自動翻訳 (Alt+T)",
    tooltipCopy: "原文をフィールドにコピー (Ctrl+Shift+C)",
    tooltipAccept: "承認 (Ctrl/Cmd + Enter または Ctrl+M)",
  }
  };

