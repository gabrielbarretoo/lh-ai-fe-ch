import { Brief, Citation, VerificationResult } from '../types';

interface BriefViewerProps {
  brief: Brief;
  onCitationClick: (citation: Citation, result: VerificationResult) => void;
  selectedCitationId: string | null;
}

export function BriefViewer({
  brief,
  onCitationClick,
  selectedCitationId,
}: BriefViewerProps) {
  const getResultForCitation = (citationId: string): VerificationResult | undefined => {
    return brief.verificationResults.find((r) => r.citationId === citationId);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      default:
        return 'lightgreen';
    }
  };

  const renderContent = () => {
    const content = brief.content;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    const citationRegex = /\[\[CITATION:(\d+)\]\]/g;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      const citationIndex = parseInt(match[1], 10) - 1;
      const citation = brief.citations[citationIndex];

      if (citation) {
        const result = getResultForCitation(citation.id);
        const severity = result?.severity || 'none';
        const isSelected = selectedCitationId === citation.id;

        parts.push(
          <span
            key={citation.id}
            onClick={() => result && onCitationClick(citation, result)}
            style={{
              backgroundColor: getSeverityColor(severity),
              padding: '2px 4px',
              cursor: 'pointer',
              border: isSelected ? '2px solid black' : 'none',
            }}
          >
            {citation.text}
          </span>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div>
      <h1>{brief.title}</h1>
      <div style={{ whiteSpace: 'pre-wrap' }}>{renderContent()}</div>
    </div>
  );
}
