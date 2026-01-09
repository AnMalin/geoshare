import React from 'react';
import { LocationAnalysis, AnalysisStatus } from '../types';
import { SparklesIcon } from './Icons';

interface AnalysisCardProps {
  status: AnalysisStatus;
  analysis: LocationAnalysis | null;
  onRetry: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ status, analysis, onRetry }) => {
  if (status === AnalysisStatus.IDLE) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full max-w-md mt-4 animate-fade-in-up">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800">AI Context</h3>
        </div>
        {status === AnalysisStatus.LOADING && (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full animate-pulse">
            Thinking...
          </span>
        )}
      </div>
      
      <div className="p-6">
        {status === AnalysisStatus.LOADING && (
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
          </div>
        )}

        {status === AnalysisStatus.ERROR && (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm mb-3">Failed to analyze location.</p>
            <button 
              onClick={onRetry}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {status === AnalysisStatus.SUCCESS && analysis && (
          <div>
            <div className="prose prose-slate prose-sm text-slate-600 leading-relaxed">
              {analysis.description}
            </div>

            {analysis.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.sources.map((source, index) => (
                    source.web && (
                      <a 
                        key={index} 
                        href={source.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg px-2 py-1 transition-colors truncate max-w-[200px]"
                      >
                        {source.web.title}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisCard;