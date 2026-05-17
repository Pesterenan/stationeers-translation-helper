import React, { useMemo } from 'react';
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

  const segments = useMemo(() => {
    // Logic for generating highlighted segments based on regex matches
    let lastIndex = 0;
    const segmentParts: React.ReactNode[] = [];

    for (const match of matches) {
      // 1. Add plain text before the current match, if any
      if (match.start > lastIndex && match.start <= text.length) {
        const preText = text.substring(lastIndex, match.start);
        segmentParts.push(<NormalTextSegment key={`pre-${match.start}`} position='pre' start={match.start} end={match.start + preText.length} text={preText} />);
      }

      // 2. Add the highlighted segment (the match)
      segmentParts.push(<MatchedTextSegment key={`match-${match.start}-${match.end}`} match={match} />);

      lastIndex = Math.max(lastIndex, match.end);
    }

    // 3. Add any remaining plain text after the last match
    if (lastIndex < text.length) {
      const postText = text.substring(lastIndex);
      segmentParts.push(<NormalTextSegment key={`post-${lastIndex}`} position='post' start={lastIndex} end={text.length} text={postText} />);
    }

    return segmentParts;
  }, [text, matches]);

  // Logic for rendering non-highlighted tags (if no complex highlights are present)
  const plainParts = useMemo(() => {
    return text.split(TAG_EXTRACTION_REGEX).filter(Boolean);
  }, [text]);

  // Determine if we should render the highlight segments or fallback to basic tag rendering
  if (matches && matches.length > 0) {
    return (
      <Typography
        variant="body2"
        whiteSpace="pre-wrap"
      >
        {segments}
      </Typography>
    );
  } else if (!text) {
    return null;
  } else {
    // Fallback: Render text using simple tag detection (no regex highlighting/ranges)
    return (
      <Typography
        variant="body2"
        whiteSpace="pre-wrap"
      >
        {plainParts.map((part, i) => {
          const isTag = (part.startsWith("{") && part.endsWith("}")) || (part.startsWith("<") && part.endsWith(">"));

          if (isTag) {
            // Use module for shortcut index to prevent array overflow if tags repeat many times
            const shortcutIndex = i % TAG_SHORTCUTS.length; 
            const shortcut = TAG_SHORTCUTS[shortcutIndex]; 
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
    );
  }
};

export default OriginalText;
