import { X, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { Citation, VerificationResult } from '../types';

interface DetailPanelProps {
  citation: Citation | null;
  result: VerificationResult | null;
  onClose?: () => void;
}

export function DetailPanel({ citation, result, onClose }: DetailPanelProps) {
  const severityClasses: Record<string, string> = {
    none: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    critical: 'bg-red-50 text-red-700 ring-red-200',
  };

  const statusLabels: Record<string, string> = {
    valid: 'Valid',
    quote_mismatch: 'Quote mismatch',
    not_found: 'Not found',
    overruled: 'Overruled',
  };

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === 'critical') {
      return <ShieldAlert className="h-4 w-4" />;
    }

    if (severity === 'warning') {
      return <AlertTriangle className="h-4 w-4" />;
    }

    return <ShieldCheck className="h-4 w-4" />;
  };

  if (!citation || !result) {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-4 text-neutral-600">
        <p className="text-sm">
          Select a citation to view verification details.
        </p>
        <p className="text-xs text-neutral-500">
          Tip: press <span className="font-semibold">J</span> or{' '}
          <span className="font-semibold">K</span> to jump between citations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Citation Detail
          </p>
          <h2 className="text-lg font-semibold text-neutral-900">Verification</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition hover:text-neutral-800"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <span
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
              severityClasses[result.severity] ?? severityClasses.none
            )}
          >
            <SeverityIcon severity={result.severity} />
            {statusLabels[result.status] ?? result.status}
          </span>
          <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            {result.severity}
          </span>
        </div>
        <p className="text-sm text-neutral-700">{result.message}</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Citation
          </p>
          <p className="mt-2 text-sm font-semibold text-neutral-900">
            {citation.text}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Case name
            </p>
            <p className="mt-1 font-medium text-neutral-800">{citation.caseName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Reporter
            </p>
            <p className="mt-1 font-medium text-neutral-800">{citation.reporter}</p>
          </div>
          {citation.pinCite && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Pin cite
              </p>
              <p className="mt-1 font-medium text-neutral-800">{citation.pinCite}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Year
            </p>
            <p className="mt-1 font-medium text-neutral-800">{citation.year}</p>
          </div>
        </div>
      </div>
      {result.details && (
        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-stone-50/70 p-4 text-sm">
          {result.details?.expectedQuote && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Quote in brief
              </p>
              <p className="mt-2 text-neutral-700">{result.details.expectedQuote}</p>
            </div>
          )}

          {result.details?.actualQuote && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Source quote
              </p>
              <p className="mt-2 text-neutral-700">{result.details.actualQuote}</p>
            </div>
          )}

          {result.details?.treatmentHistory && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Treatment history
              </p>
              <p className="mt-2 text-neutral-700">{result.details.treatmentHistory}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
