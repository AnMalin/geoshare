import React, { useState, useEffect, useCallback } from 'react';
import { Coordinates, LocationStatus, AnalysisStatus, LocationAnalysis } from './types';
import { analyzeLocationContext } from './services/geminiService';
import { wgs84ToStereo70 } from './utils/projection';
import AnalysisCard from './components/AnalysisCard';
import ShareButtons from './components/ShareButtons';
import { LocationIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(LocationStatus.IDLE);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAIAnalysis = useCallback(async (lat: number, lng: number) => {
    setAnalysisStatus(AnalysisStatus.LOADING);
    setAnalysis(null);
    try {
      const result = await analyzeLocationContext(lat, lng);
      setAnalysis(result);
      setAnalysisStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setAnalysisStatus(AnalysisStatus.ERROR);
    }
  }, []);

  const getLocation = useCallback(() => {
    setLocationStatus(LocationStatus.LOADING);
    setErrorMsg(null);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setAnalysis(null);

    if (!navigator.geolocation) {
      setLocationStatus(LocationStatus.ERROR);
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Convert to Stereo 70
        const stereo70 = wgs84ToStereo70(latitude, longitude);

        setCoords({ latitude, longitude, accuracy, stereo70 });
        setLocationStatus(LocationStatus.SUCCESS);
        
        // Auto-fetch AI context once location is found
        fetchAIAnalysis(latitude, longitude);
      },
      (error) => {
        setLocationStatus(LocationStatus.ERROR);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMsg("The request to get user location timed out.");
            break;
          default:
            setErrorMsg("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [fetchAIAnalysis]);

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <LocationIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">GeoShare AI</h1>
          </div>
          <button 
            onClick={getLocation}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Refresh Location"
          >
            <RefreshIcon className={`w-5 h-5 ${locationStatus === LocationStatus.LOADING ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md px-4 py-8 flex flex-col items-center gap-4">
        
        {/* Error Message */}
        {locationStatus === LocationStatus.ERROR && (
          <div className="w-full bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-start gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{errorMsg || "Unable to retrieve location."}</p>
          </div>
        )}

        {/* Loading State */}
        {locationStatus === LocationStatus.LOADING && (
          <div className="w-full h-48 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-3 animate-pulse">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="text-sm font-medium text-slate-500">Acquiring satellites...</p>
          </div>
        )}

        {/* Coordinates Display */}
        {locationStatus === LocationStatus.SUCCESS && coords && (
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
            <div className="bg-slate-900 px-6 py-6 text-white flex flex-col items-center justify-center gap-2 relative overflow-hidden">
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
               
               {/* WGS84 */}
               <div className="flex w-full justify-between items-start mb-2 px-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">WGS 84</p>
               </div>
               <div className="flex w-full justify-around mb-4">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-bold font-mono tracking-tighter">
                      {coords.latitude.toFixed(5)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Latitude</div>
                  </div>
                  <div className="w-px bg-slate-700 h-10 self-center"></div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl md:text-3xl font-bold font-mono tracking-tighter">
                      {coords.longitude.toFixed(5)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Longitude</div>
                  </div>
               </div>

               {/* Stereo 70 */}
               {coords.stereo70 && (
                 <>
                   <div className="w-full h-px bg-slate-800 my-2"></div>
                   <div className="flex w-full justify-between items-start mb-2 px-2">
                      <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Stereo 70 (Ro)</p>
                   </div>
                   <div className="flex w-full justify-around mb-2">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-bold font-mono tracking-tight text-indigo-100">
                          {coords.stereo70.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-indigo-300/60 mt-0.5">N (Northing)</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-bold font-mono tracking-tight text-indigo-100">
                          {coords.stereo70.x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-indigo-300/60 mt-0.5">E (Easting)</div>
                      </div>
                   </div>
                 </>
               )}
               
               <p className="mt-4 text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md">
                 Accuracy: ±{coords.accuracy.toFixed(0)}m
               </p>
            </div>
            
            {/* Embedded Map */}
            <div className="w-full h-64 bg-slate-100 border-t border-slate-200 relative">
               <iframe 
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 scrolling="no" 
                 src={`https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=16&output=embed`}
                 title="Google Maps Location"
                 className="absolute inset-0"
                 loading="lazy"
               ></iframe>
            </div>

            <div className="p-3 bg-white border-t border-slate-200 text-center">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 group"
              >
                Open in Full Google Maps App
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Gemini AI Analysis Card */}
        {locationStatus === LocationStatus.SUCCESS && coords && (
          <AnalysisCard 
            status={analysisStatus}
            analysis={analysis}
            onRetry={() => fetchAIAnalysis(coords.latitude, coords.longitude)}
          />
        )}

        {/* Initial Prompt (if needed, though we auto-load) */}
        {locationStatus === LocationStatus.IDLE && (
           <div className="text-center text-slate-400 mt-10">
             <p>Waiting to initialize...</p>
           </div>
        )}

      </main>

      {/* Share Actions - Fixed at bottom */}
      {locationStatus === LocationStatus.SUCCESS && coords && (
        <ShareButtons 
          coords={coords} 
          locationDescription={analysis?.description} 
        />
      )}
    </div>
  );
};

export default App;