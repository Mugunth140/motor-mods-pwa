import { useEffect, useState } from 'react';
import './DesktopBlocker.css';

interface DesktopBlockerProps {
    children: React.ReactNode;
}

const MOBILE_BREAKPOINT = 1024; // Mobile/Tablet max width

export const DesktopBlocker: React.FC<DesktopBlockerProps> = ({ children }) => {
    const [isDesktop, setIsDesktop] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth > MOBILE_BREAKPOINT);
            setChecked(true);
        };

        // Initial check
        checkScreenSize();

        // Listen for resizes
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Don't render anything until we've checked
    if (!checked) {
        return null;
    }

    if (isDesktop) {
        return (
            <div className="desktop-blocker">
                <div className="blocker-content">
                    <div className="blocker-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                    </div>
                    <h1>Mobile Access Only</h1>
                    <p className="blocker-message">
                        Open this link in your <strong>mobile phone</strong> or <strong>tablet</strong> to access the inventory database.
                    </p>
                    <div className="blocker-hint">
                        <span className="hint-icon">💡</span>
                        <span>Scan the QR code below or share this link to your mobile device</span>
                    </div>
                    <div className="url-display">
                        <code>{window.location.href}</code>
                        <button
                            className="copy-btn"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                            }}
                        >
                            Copy
                        </button>
                    </div>
                    <div className="device-icons">
                        <div className="device-supported">
                            <span className="checkmark">✓</span>
                            <span>Mobile</span>
                        </div>
                        <div className="device-supported">
                            <span className="checkmark">✓</span>
                            <span>Tablet</span>
                        </div>
                        <div className="device-blocked">
                            <span className="crossmark">✕</span>
                            <span>Desktop</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
