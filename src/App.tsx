import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefViewer } from './components/BriefViewer';
import { FileText, ShieldCheck } from 'lucide-react';
import { sampleBrief } from './data/sampleBrief';
import { Citation, VerificationResult } from './types';
import clsx from 'clsx';
import { DetailPanel } from './components';
import { CitationsGuide } from './components/CitaionsGuide';

function App() {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [selectedResult, setSelectedResult] = useState<VerificationResult | null>(null);


  const resultsByCitationId = useMemo(() => {
    return new Map(
      sampleBrief.verificationResults.map((result) => [result.citationId, result])
    );
  }, []);

  const citations = sampleBrief.citations;

  const healthScore = useMemo(() => {
    const weights: Record<string, number> = {
      none: 1,
      warning: 0.75,
      critical: 0.4,
    };

    const total =
      sampleBrief.verificationResults.reduce((sum, result) => {
        return sum + (weights[result.severity] ?? 1);
      }, 0) / sampleBrief.verificationResults.length;

    return Math.round(total * 100);
  }, []);

  const scrollToCitation = useCallback((citationId: string) => {
    const element = document.getElementById(`citation-${citationId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const selectCitation = useCallback(
    (citation: Citation, result: VerificationResult, shouldScroll = false) => {
      setSelectedCitation(citation);
      setSelectedResult(result);

      if (shouldScroll) {
        requestAnimationFrame(() => scrollToCitation(citation.id));
      }
    },
    [scrollToCitation]
  );

  const handleCitationClick = useCallback(
    (citation: Citation, result: VerificationResult) => {
      selectCitation(citation, result);
    },
    [selectCitation]
  );

  const handleCloseDrawer = useCallback(() => {
    setSelectedCitation(null);
    setSelectedResult(null);
  }, []);

  const jumpToCitation = useCallback(
    (direction: 'next' | 'prev') => {
      if (!citations.length) {
        return;
      }

      let nextIndex = selectedCitation
        ? citations.findIndex((citation) => citation.id === selectedCitation.id)
        : -1;
      if (nextIndex === -1) {
        nextIndex = direction === 'next' ? 0 : citations.length - 1;
      } else {
        nextIndex =
          (nextIndex + (direction === 'next' ? 1 : -1) + citations.length) %
          citations.length;
      }

      const citation = citations[nextIndex];
      const result = resultsByCitationId.get(citation.id);
      if (result) {
        selectCitation(citation, result, true);
      }
    },
    [citations, resultsByCitationId, selectCitation, selectedCitation]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.key === 'Escape') {
        handleCloseDrawer();
        return;
      }

      if (event.key.toLowerCase() === 'j') {
        event.preventDefault();
        jumpToCitation('next');
      }

      if (event.key.toLowerCase() === 'k') {
        event.preventDefault();
        jumpToCitation('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseDrawer, jumpToCitation]);

  const isDrawerOpen = Boolean(selectedCitation && selectedResult);

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f4ec]/60 to-[#f8f4ec]/10" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-12">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-3 shadow-sm">
                <FileText className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">
                  Trusted Hand
                </p>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  Citation Verification
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3 shadow-sm">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                  Document Health
                </p>
                <p className="text-lg font-semibold text-neutral-900">
                  Score {healthScore}%
                </p>
              </div>
            </div>
          </header>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_160px]">
            <BriefViewer
              brief={sampleBrief}
              onCitationClick={handleCitationClick}
              selectedCitationId={selectedCitation?.id || null}
            />

            <CitationsGuide citations={citations} resultsByCitationId={resultsByCitationId} selectedCitation={selectedCitation} selectCitation={selectCitation} />
          </div>
        </div>

        <div
          className={clsx(
            'fixed inset-0 z-40 transition',
            isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
          aria-hidden={!isDrawerOpen}
        >
          <div
            className={clsx(
              'absolute inset-0 bg-neutral-900/20 transition-opacity duration-300',
              isDrawerOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={handleCloseDrawer}
          />
          <aside
            className={clsx(
              'absolute right-0 top-0 h-full w-full max-w-md border-l border-neutral-200 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur transition-transform duration-300',
              isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <DetailPanel
              citation={selectedCitation}
              result={selectedResult}
              onClose={handleCloseDrawer}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export default App;
