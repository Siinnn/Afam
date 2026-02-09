import { Shield } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow sm:p-8 p-6">
                <div className="text-center mb-10">
                    <Shield className="mx-auto h-12 w-12 text-emerald-600" />
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Protection de vos données personnelles (RGPD)
                    </p>
                </div>

                <div className="prose prose-emerald max-w-none text-gray-700">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                        <p className="mb-4">
                            L'Association des Femmes Actives de Mutsamudu (AFAM) s'engage à protéger la
                            vie privée de ses membres et utilisateurs. Cette politique de confidentialité
                            explique comment nous collectons, utilisons et protégeons vos données personnelles
                            conformément au Règlement Général sur la Protection des Données (RGPD).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
                        <p className="mb-4">
                            Nous collectons les informations suivantes lorsque vous créez un compte ou
                            interagissez avec notre site :
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Adresse email</li>
                            <li>Nom d'utilisateur (si fourni)</li>
                            <li>Contenu de vos publications et commentaires</li>
                            <li>Date de création du compte et de dernière connexion</li>
                            <li>Informations sur le rôle utilisateur (membre, administrateur)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Utilisation des données</h2>
                        <p className="mb-4">Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Gérer votre compte utilisateur et votre authentification.</li>
                            <li>Vous permettre de publier des articles ou des commentaires.</li>
                            <li>Communiquer avec vous concernant les activités de l'association.</li>
                            <li>Assurer la sécurité et modérer le contenu du site.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Vos droits (RGPD)</h2>
                        <p className="mb-4">
                            Conformément à la réglementation en vigueur, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données personnelles (disponible via l'export de données dans votre profil).</li>
                            <li><strong>Droit de rectification :</strong> Vous pouvez modifier vos informations personnelles depuis votre profil.</li>
                            <li><strong>Droit à l'effacement :</strong> Vous pouvez supprimer votre compte et vos données personnelles à tout moment depuis votre profil ("Droit à l'oubli").</li>
                            <li><strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du traitement de vos données.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Conservation des données</h2>
                        <p className="mb-4">
                            Nous conservons vos données tant que votre compte est actif. Si vous choisissez de
                            supprimer votre compte, vos données personnelles seront effacées de nos serveurs,
                            bien que certaines traces anonymisées puissent être conservées à des fins statistiques
                            ou légales.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
                        <p className="mb-4">
                            Ce site utilise un minimum de cookies nécessaires au fonctionnement de l'authentification
                            (session utilisateur). Nous n'utilisons pas de cookies publicitaires ou de traçage tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
                        <p className="mb-4">
                            Pour toute question concernant cette politique ou vos données personnelles, vous pouvez
                            nous contacter via la page <a href="/contact" className="text-emerald-600 hover:underline">Contact</a>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
