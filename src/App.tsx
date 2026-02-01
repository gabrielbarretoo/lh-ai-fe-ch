import { useMemo, useState } from 'react';
import { BriefViewer } from './components/BriefViewer';
import { FileText, ShieldCheck } from 'lucide-react';
import { sampleBrief } from './data/sampleBrief';
import { Citation, VerificationResult } from './types';

function App() {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [selectedResult, setSelectedResult] = useState<VerificationResult | null>(null);

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

  const handleCitationClick = (citation: Citation, result: VerificationResult) => {
    setSelectedCitation(citation);
    setSelectedResult(result);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">
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
        </div>
      </div>
    </div>
  );
}

export default App;
