import type { TranslationSchema } from "./index.ts";

export const zh: TranslationSchema = {
  app: {
    title: "Stationeers 翻译助手",
    subtitle: "导入原游戏 XML 文件，编辑翻译并导出新的 XML",
    loading: "正在处理文件...",
  },
  toolbar: {
    import: "导入 XML / JSON",
    settings: "项目设置",
    saveProgress: "保存进度",
    downloadXml: "下载 XML",
    searchPlaceholder: "搜索",
    searchTooltip: "输入超过 3 个字母进行搜索",
    showAccepted: "显示已接受的条目",
    showEmpty: "显示空条目",
    totalProgress: "总进度",
    draftSaved: "草稿保存于",
  },
  dialogConfig: {
    title: "项目设置",
    description: "调整 XML 文件元数据和导出设置。",
    uiLanguageLabel: "接口语言",
    languageLabel: "语言名称 (例如: Portuguese)",
    codeLabel: "语言代码 (例如: pb)",
    fontLabel: "字体 (字符集)",
    exportFileLabel: "导出文件名 (例如: portuguese.xml)",
    exportFileHelper: "如果为空，将根据语言使用默认名称。",
    resetProject: "重置项目",
    cancel: "取消",
    save: "保存设置",
  },
  dialogGoToPage: {
    title: "跳转到页面:",
    of: "/",
    cancel: "取消",
    go: "跳转",
  },
  importer: {
    errorPrefix: "仅允许原始游戏文件 (以 'english' 开头) 或进度文件 'english_progress.json'。",
    errorUnknown: "未知文件类型。请使用 .xml 或 .json",
  },
  messages: {
    xmlError: "解析 XML 错误:",
    jsonError: "导入 JSON 进度错误:",
    exportError: "生成翻译后的 XML 错误:",
    draftRecovered: "已从本地存储恢复 {lang} 的草稿。",
    noXml: "未加载 XML",
    confirmReset: "这将清除语言设置和加载的文件。是否继续？",
  },
  translationItem: {
    key: "键:",
    original: "原文:",
    translation: "翻译:",
    actions: "操作:",
    tooltipTranslate: "自动翻译 (Alt+T)",
    tooltipCopy: "复制原文到输入框 (Ctrl+Shift+C)",
    tooltipAccept: "采纳 (Ctrl/Cmd + Enter 或 Ctrl+M)",
  }
};
