import clsx from "clsx";
import { Citation, VerificationResult } from "../types";

interface CitationsGuideProps {
    citations: Citation[]
    resultsByCitationId: Map<string, VerificationResult>;
    selectedCitation: Citation | null;
    selectCitation: (citation: Citation, result: VerificationResult, fromGuide?: boolean) => void;
}

export function CitationsGuide({ citations, resultsByCitationId, selectedCitation, selectCitation }: CitationsGuideProps) {
    return (
        <aside className="order-first lg:order-none lg:pt-12">
            <div className="sticky top-12 space-y-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 text-sm shadow-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-neutral-500">
                    <span>Citations</span>
                    <span>{citations.length}</span>
                </div>
                <div className="space-y-3">
                    {citations.map((citation, index) => {
                        const result = resultsByCitationId.get(citation.id);
                        const severity = result?.severity ?? 'none';
                        const isSelected = selectedCitation?.id === citation.id;

                        const dotClass = clsx(
                            'h-2 w-2 min-h-2 min-w-2 rounded-full',
                            severity === 'critical' && 'bg-red-500',
                            severity === 'warning' && 'bg-amber-500',
                            severity === 'none' && 'bg-emerald-500'
                        );

                        return (
                            <div
                                key={citation.id}
                                onClick={() => {
                                    if (result) {
                                        selectCitation(citation, result, true);
                                    }
                                }}
                                className={clsx(
                                    'cursor-pointer flex w-full items-center gap-2 border border-transparent py-2 text-left text-xs text-neutral-700 transition',
                                    isSelected && 'text-neutral-900'
                                )}
                                aria-label={`Jump to citation ${index + 1}`}
                            >
                                <span className={dotClass} />
                                {/* <span className="font-semibold text-neutral-900">C{index + 1}</span> */}
                                <span className={clsx("truncate text-neutral-500 hover:text-neutral-700", isSelected && "text-neutral-900")}>{citation.caseName}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-xl border border-dashed border-neutral-200 px-3 py-2 text-[11px] text-neutral-500">
                    Use <span className="font-semibold">J</span>/<span className="font-semibold">K</span> to
                    navigate.
                </div>
            </div>
        </aside>
    )
}