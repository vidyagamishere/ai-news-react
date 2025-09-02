import React, { useEffect, useRef } from 'react';
import './AdUnit.css';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdUnit({ 
  adSlot, 
  adFormat = 'auto', 
  responsive = true,
  className = '',
  style = {}
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  // Check if ads are enabled
  const adsEnabled = import.meta.env.VITE_ENABLE_ADS === 'true';
  
  // Don't render anything if ads are disabled
  if (!adsEnabled) {
    return null;
  }

  useEffect(() => {

    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      window.adsbygoogle = window.adsbygoogle || [];
    }

    // Initialize ad after component mounts
    if (adRef.current && !isAdLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (error) {
        console.warn('AdSense error:', error);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <div className="ad-label">Advertisement</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}