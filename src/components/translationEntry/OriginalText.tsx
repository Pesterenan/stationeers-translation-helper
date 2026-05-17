import { Typography, alpha, Badge, Box } from "@mui/material";
import { TAG_EXTRACTION_REGEX, TAG_SHORTCUTS } from "../../constants";
import type { TRegexMatch } from "../../types";

interface IOriginalTextProps {
  id?: string;
  text: string;
  matches: Array<TRegexMatch>;
  onTagClick: (tag: string) => void;
}

const NormalTextSegment: React.FC<{ position: 'pre' | 'post', start: number, end: number, text: string }> = ({ position, start, end, text }) => {
  return (
    <Typography component='span'
      variant="body2"
      key={`${position}-${start}-${end}`}>
      {text}
    </Typography>
  );
};

/** Enphasized regex matched span component */
const MatchedTextSegment: React.FC<{ match: TRegexMatch }> = ({ match: { start, end, matchText } }) => (
  <Typography component='span'
    key={`match-${start}-${end}`}
    variant="body2"
    sx={{
      background: (theme) => `linear-gradient(to right, ${theme.palette.warning.light}, ${theme.palette.warning.dark})`,
      color: (theme) => alpha(theme.palette.warning.contrastText, 1),
      borderRadius: 1,
    }}
  >
    {matchText}
  </Typography>
);

/** Componente responsável por renderizar o texto original.
 * Ele lida com a exibição de tags (links, etc.) e também aceita um array de ranges
 * para aplicar destaque dinâmico baseado em regex. */
const OriginalText: React.FC<IOriginalTextProps> = ({ id, text, matches, onTagClick }) => {
  if (!text) return null;

  const parts = text.split(TAG_EXTRACTION_REGEX).filter(Boolean);

  let lastIndex = 0;
  const segments: React.ReactNode[] = [];

  for (const match of matches) {
    // 1. Adiciona o texto em plain antes do match, se houver
    if (match.start >= lastIndex && match.start <= text.length) {
      const preText = text.substring(lastIndex, Math.min(match.start, text.length));
      segments.push(<NormalTextSegment position='pre' start={match.start} end={Math.max(match.start, text.length)} text={preText} />);
    }

    // 2. Adiciona o segmento destacado (o match)
    segments.push(<MatchedTextSegment match={match} />
    );

    lastIndex = Math.max(lastIndex, match.end);
  }

  // 3. Adiciona qualquer texto plain restante após o último match
  if (lastIndex < text.length) {
    const postText = text.substring(lastIndex);
    segments.push(<NormalTextSegment position='post' start={lastIndex} end={text.length} text={postText} />);
  }

  // Renderiza o conteúdo destacado (ranges) OU as tags se não houver ranges de destaque complexos.
  if (matches && matches.length > 0) {
    return (<Typography
      variant="body2"
      whiteSpace="pre-wrap"
    >
      {segments}
    </Typography>);
  } else if (!text) {
    return null;
  } else {
    // Se não há ranges, apenas renderiza o texto original com as tags separadas por split()
    return (
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
    )
  }
};

export default OriginalText;
