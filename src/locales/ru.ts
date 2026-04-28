import type { TTranslationSchema } from "./index.ts";

export const ru: TTranslationSchema = {
  app: {
    title: "Stationeers Translation Helper",
    subtitle: "Импортируйте оригинальный XML-файл игры, отредактируйте переводы и экспортируйте новый XML",
    loading: "Обработка файла...",
  },
  toolbar: {
    import: "Импорт XML / JSON",
    settings: "Настройки",
    saveProgress: "Сохранить прогресс",
    downloadXml: "Скачать XML",
    searchPlaceholder: "Поиск",
    searchTooltip: "Введите более 3 букв для поиска",
    showAccepted: "Показать принятые записи",
    showEmpty: "Показать пустые записи",
    totalProgress: "Общий прогресс",
    draftSaved: "Черновик сохранен в",
  },
  dialogConfig: {
    title: "Настройки",
    description: "Настройте язык приложения и параметры экспорта.",
    uiLanguageLabel: "Язык интерфейса",
    filePropertiesDescription: "Настройте параметры языка экспортируемого файла.",
    languageLabel: "Название языка (напр.: Portuguese)",
    codeLabel: "Код языка (напр.: pb)",
    fontLabel: "Шрифт (набор символов)",
    originalFileLabel: "Основной файл (идентификатор черновика)",
    originalFileHelper: "Это имя файла, загруженного в качестве основы для перевода.",
    exportFileLabel: "Имя экспортируемого файла",
    exportFileHelper: "Если пусто, будет основано на языке.",
    resetProject: "Сбросить проект",
    cancel: "Отмена",
    save: "Сохранить настройки",
  },
  dialogGoToPage: {
    title: "Перейти на страницу:",
    of: "из",
    cancel: "Отмена",
    go: "Перейти",
  },
  importer: {
    errorPrefix: "Разрешены только оригинальные файлы игры (начинающиеся с 'english') или файлы прогресса 'english_progress.json'.",
    errorUnknown: "Неизвестный тип файла. Используйте .xml или .json",
  },
  messages: {
    xmlError: "Ошибка парсинга XML:",
    jsonError: "Ошибка импорта прогресса JSON:",
    exportError: "Ошибка генерации переведенного XML:",
    draftRecovered: "Черновик для {lang} восстановлен из локального хранилища.",
    noXml: "XML не загружен",
    confirmReset: "Это очистит настройки языка и загруженный файл. Продолжить?",
  },
  translationItem: {
    key: "Ключ:",
    original: "Оригинал:",
    translation: "Перевод:",
    actions: "Действия:",
    tooltipTranslate: "Автоматический перевод (Alt+T)",
    tooltipCopy: "Копировать оригинал в поле (Ctrl+Shift+C)",
    tooltipAccept: "Принять (Ctrl/Cmd + Enter или Ctrl+M)",
  }
};
