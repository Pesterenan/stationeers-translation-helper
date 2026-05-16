import { Typography, alpha, Badge, Box } from "@mui/material";

const TAG_SHORTCUTS = ["y", "u", "i", "o", "p", "Y", "U", "I", "O", "P"];

interface IOriginalTextProps {
  id?: string;
  text: string;
  matches: Array<{ start: number; end: number; matchText: string }>;
  onTagClick: (tag: string) => void;
}

/**
 * Componente responsável por renderizar o texto original.
 * Ele lida com a exibição de tags (links, etc.) e também aceita um array de ranges
 * para aplicar destaque dinâmico baseado em regex, resolvendo problemas anteriores.
 */
const OriginalText: React.FC<IOriginalTextProps> = ({ id, text, matches, onTagClick }) => {
  if (!text) return null;

  // Regex para capturar tags como {LINK:Page;Text}, {THING:Prefab}, {LIST_OF_RESOURCES}, etc.
  const underscoredWords = "(\\{(?:[A-Z_]+)(?::[^}]*)?\\})";
  const htmlTags = "(<(?:size|color)=(?::\\d+|\\w+)%?>|</(?:size|color)>)";
  // Esta regex é usada apenas para identificar e separar as tags, não para destacar ranges.
  const tagExtractionRegex = new RegExp(`${underscoredWords}|${htmlTags}`, "g");
  const parts = text.split(tagExtractionRegex).filter(Boolean);

  let lastIndex = 0;
  const segments: React.ReactNode[] = [];

  for (const match of matches) {
    // 1. Adiciona o texto em plain antes do match, se houver
    if (match.start >= lastIndex && match.start <= text.length) {
      const preText = text.substring(lastIndex, Math.min(match.start, text.length));
      segments.push(<Typography component='span'
        key={`pre-${match.start}-${Math.max(match.start, text.length)}`}>
        {preText}
      </Typography>);
    }

    // 2. Adiciona o segmento destacado (o match)
    const matchedText = match.matchText;
    segments.push(
      <Typography component='span'
        key={`match-${match.start}-${match.end}`}
        variant="body2"
        sx={{
          backgroundColor: (theme) => alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 1 : 0.2),
          color: (theme) => alpha(theme.palette.warning.contrastText, 1),
          borderRadius: 1,
          px: 0.3,
          py: 0.05,
        }}
      >
        {matchedText}
      </Typography>
    );

    lastIndex = Math.max(lastIndex, match.end);
  }

  // 3. Adiciona qualquer texto plain restante após o último match
  if (lastIndex < text.length) {
    const postText = text.substring(lastIndex);
    segments.push(<Typography component='span' key={`post-${lastIndex}-${text.length}`}>{postText}</Typography>);
  }

  // Renderiza o conteúdo destacado (ranges) OU as tags se não houver ranges de destaque complexos.
  if (matches && matches.length > 0) {
    return <>{segments}</>;
  } else if (!text) {
    return null;
  } else {
    // Se não há ranges, apenas renderiza o texto original com as tags separadas por split()
    return (
      <>
        <Typography
          variant="body2"
          whiteSpace="pre-wrap"
        >
          {parts.map((part, i) => {
            if ((part.startsWith("{") && part.endsWith("}")) || (part.startsWith("<") && part.endsWith(">"))) {
              const shortcut = TAG_SHORTCUTS[i % TAG_SHORTCUTS.length]; // Usa módulo para evitar overflow do array de shortcuts
              return (
                <Badge
                  key={`${i}-${shortcut}`}
                  anchorOrigin={{ horizontal: "left", vertical: "top" }}
                  badgeContent={shortcut}
                  color="info"
                  sx={{ ml: 1 }}
                >
                  <Box
                    id={`${id}-tag-${shortcut}`}
                    component="span"
                    onClick={() => onTagClick(part)}
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      borderRadius: 1,
                      color: "primary.main",
                      cursor: "pointer",
                      display: "inline-block",
                      fontWeight: "bold",
                      marginInline: 0.2,
                      paddingInline: 0.5,
                      textDecoration: "underline",
                      verticalAlign: "middle",
                      "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        color: "primary.dark",
                      },
                    }}
                  >
                    {part}
                  </Box>
                </Badge>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </Typography>
      </>
    )
  }
};

export default OriginalText;
