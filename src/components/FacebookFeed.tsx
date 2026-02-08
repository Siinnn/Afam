'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Composant pour intégrer le flux Facebook de l'AFAM.
 * Utilise le plugin de page Facebook officiel via iframe.
 */
export default function FacebookFeed() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = React.useState(340);

    // Ajuster la largeur de l'iframe en fonction du conteneur
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                // Facebook plugin min width is 180, max is 500
                const newWidth = Math.min(500, Math.max(180, containerRef.current.clientWidth));
                setWidth(newWidth);
            }
        };

        handleResize(); // Initial call
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // L'URL de la page Facebook
    // Note: Pour les nouvelles pages "Expérience", il faut souvent utiliser l'ID ou le format spécifique
    const pageUrl = "https://www.facebook.com/profile.php?id=100088315476380";

    // Construction de l'URL de l'iframe
    const iframeSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageUrl)}&tabs=timeline&width=${width}&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

    return (
        <div className="bg-white rounded-lg shadow-lg border border-emerald-50 overflow-hidden">
            <div className="p-4 bg-emerald-600 text-white">
                <h2 className="text-xl font-bold flex items-center">
                    <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Suivez-nous sur Facebook
                </h2>
                <p className="text-emerald-100 text-sm">Nos dernières actualités en direct</p>
            </div>

            <div
                ref={containerRef}
                className="p-4 flex justify-center bg-gray-50 min-h-[500px]"
            >
                <iframe
                    src={iframeSrc}
                    width={width}
                    height="600"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="AFAM Facebook Feed"
                />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <a
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center"
                >
                    Voir la page complète
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </a>
            </div>
        </div>
    );
}
