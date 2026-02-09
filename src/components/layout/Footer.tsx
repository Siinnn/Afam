import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-emerald-50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-lg font-bold text-emerald-600">AFAM Mutsamudu</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Association des Femmes Actives de Mutsamudu
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                        <Link href="/privacy" className="hover:text-emerald-600 transition-colors flex items-center">
                            <Shield size={16} className="mr-1" />
                            Politique de Confidentialité (RGPD)
                        </Link>
                        {/* <Link href="/legal" className="hover:text-emerald-600 transition-colors">
              Mentions Légales
            </Link> */}
                        <Link href="/contact" className="hover:text-emerald-600 transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
                    <p>&copy; {currentYear} AFAM Mutsamudu. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
