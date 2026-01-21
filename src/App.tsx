import { useState } from 'react';
import { BriefViewer } from './components/BriefViewer';
import { DetailPanel } from './components/DetailPanel';
import { sampleBrief } from './data/sampleBrief';
import { Citation, VerificationResult } from './types';

function App() {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [selectedResult, setSelectedResult] = useState<VerificationResult | null>(null);

  const handleCitationClick = (citation: Citation, result: VerificationResult) => {
    setSelectedCitation(citation);
    setSelectedResult(result);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <BriefViewer
          brief={sampleBrief}
          onCitationClick={handleCitationClick}
          selectedCitationId={selectedCitation?.id || null}
        />
      </div>
      <div style={{ width: '400px', borderLeft: '1px solid black', padding: '10px' }}>
        <DetailPanel citation={selectedCitation} result={selectedResult} />
      </div>
    </div>
  );
}

export default App;
