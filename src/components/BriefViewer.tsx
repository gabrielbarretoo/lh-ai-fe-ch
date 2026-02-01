import { useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import type { Literal, Parent, Node } from 'unist';
import clsx from 'clsx';
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
  const resultsByCitationId = useMemo(() => {
    return new Map(
      brief.verificationResults.map((result) => [result.citationId, result])
    );
  }, [brief.verificationResults]);

  const citationByIndex = useMemo(() => {
    return new Map(brief.citations.map((citation, index) => [index + 1, citation]));
  }, [brief.citations]);

  const severityClasses: Record<string, string> = {
    none: 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:ring-emerald-500',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200 hover:ring-amber-500',
    critical: 'bg-red-50 text-red-700 ring-red-200 hover:ring-red-500',
  };

  const remarkCitations = () => {
    return (tree: Node) => {
      visit(tree, 'text', (node: Literal, index, parent: Parent | null) => {
        if (!parent || typeof node.value !== 'string') {
          return;
        }

        const regex = /\[\[CITATION:(\d+)\]\]/g;
        if (!regex.test(node.value)) {
          return;
        }

        regex.lastIndex = 0;
        const newNodes: Array<{ type: string; value?: string; data?: any }> = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.value)) !== null) {
          const before = node.value.slice(lastIndex, match.index);
          if (before) {
            newNodes.push({ type: 'text', value: before });
          }

          newNodes.push({
            type: 'citation',
            data: {
              hName: 'citation',
              hProperties: {
                index: match[1],
              },
            },
          });

          lastIndex = match.index + match[0].length;
        }

        const after = node.value.slice(lastIndex);
        if (after) {
          newNodes.push({ type: 'text', value: after });
        }

        parent.children.splice(index || 0, 1, ...newNodes);
        return (index || 0) + newNodes.length;
      });
    };
  };

  const markdownComponents: Components & {
    citation: ({ node }: { node: unknown }) => JSX.Element | null;
  } = {
    h1: ({ children }) => (
      <h1 className="font-ui text-2xl font-semibold text-neutral-900 md:text-3xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 font-ui text-xl font-semibold text-neutral-900 md:text-2xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-ui text-lg font-semibold text-neutral-900">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mt-4 text-neutral-800/90 first:mt-0">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-neutral-800/90">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-neutral-800/90">
        {children}
      </ol>
    ),
    li: ({ children }) => <li>{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-neutral-300 pl-4 text-neutral-700">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-neutral-900">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-neutral-700">{children}</em>,
    citation: ({ node }) => {
      const index = Number((node as any)?.properties?.index);
      if (!index) {
        return null;
      }

      const citation = citationByIndex.get(index);
      if (!citation) {
        return null;
      }

      const result = resultsByCitationId.get(citation.id);
      if (!result) {
        return null;
      }

      const severity = result.severity ?? 'none';
      const isSelected = selectedCitationId === citation.id;

      return (
        <button
          id={`citation-${citation.id}`}
          type="button"
          onClick={() => onCitationClick(citation, result)}
          className={clsx(
            'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold transition',
            'font-ui ring-1 ring-inset hover:scale-[1.005] hover:translate-y-[-1px] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/70 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50',
            severityClasses[severity] ?? severityClasses.none,
            isSelected && 'ring-2 ring-neutral-900/70'
          )}
          aria-pressed={isSelected}
          title={citation.text}
        >
          {citation.text}
        </button>
      );
    },
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
          Brief
        </p>
        <h1 className="font-ui text-3xl font-semibold text-neutral-900 md:text-4xl">
          {brief.title}
        </h1>
      </div>
      <article className="rounded-2xl bg-white/80 px-6 py-8 font-brief text-[17px] leading-8 text-neutral-800 shadow-sm ring-1 ring-neutral-200/80 backdrop-blur md:px-10 md:py-10">
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkCitations]} components={markdownComponents}>
          {brief.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
