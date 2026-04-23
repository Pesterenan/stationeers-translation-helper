import type { TranslationSchema } from "./index.ts";

export const pt: TranslationSchema = {
  app: {
    title: "Stationeers Translation Helper",
    subtitle: "Importe o arquivo XML original do jogo, edite as traduções e exporte o novo XML",
    loading: "Processando arquivo...",
  },
  toolbar: {
    import: "Importar XML / JSON",
    settings: "Configurar Projeto",
    saveProgress: "Salvar Progresso",
    downloadXml: "Baixar XML",
    searchPlaceholder: "Pesquisar",
    searchTooltip: "Digite mais que 3 letras do que está procurando para pesquisar",
    showAccepted: "Mostrar entradas aceitas",
    showEmpty: "Mostrar entradas vazias",
    totalProgress: "Progresso Total",
    draftSaved: "Rascunho salvo às",
  },
  dialogConfig: {
    title: "Configurações do Projeto",
    description: "Ajuste os metadados do arquivo XML e as configurações de exportação.",
    uiLanguageLabel: "Idioma da Interface",
    languageLabel: "Nome do Idioma (Ex: Portuguese)",
    codeLabel: "Código do Idioma (Ex: pb)",
    fontLabel: "Fonte (Conjunto de Caracteres)",
    originalFileLabel: "Arquivo Mestre (ID do Rascunho)",
    originalFileHelper: "Este nome identifica seu rascunho no navegador. Não altere manualmente.",
    exportFileLabel: "Nome do Arquivo Exportado (Ex: portuguese.xml)",
    exportFileHelper: "Se vazio, usará o nome padrão baseado no idioma.",
    resetProject: "Resetar Projeto",
    cancel: "Cancelar",
    save: "Salvar Configurações",
  },
  dialogGoToPage: {
    title: "Ir para página:",
    of: "de",
    cancel: "Cancelar",
    go: "Ir",
  },
  importer: {
    errorPrefix: "Apenas arquivos originais do jogo (começando com 'english') ou arquivos de progresso 'english_progress.json' são permitidos.",
    errorUnknown: "Tipo de arquivo desconhecido. Use .xml ou .json",
  },
  messages: {
    xmlError: "Erro ao parsear XML:",
    jsonError: "Erro ao importar progresso JSON:",
    exportError: "Erro ao gerar XML traduzido:",
    draftRecovered: "Rascunho para {lang} recuperado do LocalStorage.",
    noXml: "Nenhum XML carregado",
    confirmReset: "Isso irá limpar as configurações do idioma e o arquivo carregado. Deseja continuar?",
  },
  translationItem: {
    key: "Chave:",
    original: "Original:",
    translation: "Tradução:",
    actions: "Ações:",
    tooltipTranslate: "Traduzir automaticamente (Alt+T)",
    tooltipCopy: "Copiar original para o campo (Ctrl+Shift+C)",
    tooltipAccept: "Aceitar (Ctrl/Cmd + Enter ou Ctrl+M)",
  }
};
