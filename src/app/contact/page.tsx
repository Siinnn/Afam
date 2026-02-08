'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Schéma de validation Zod
const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nous serions ravis d'avoir de vos nouvelles. N'hésitez pas à nous contacter via nos réseaux sociaux ou par téléphone.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Informations de contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de contact</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="text-emerald-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                    <p className="text-gray-600">
                      Centre communautaire AFAM<br />
                      Mutsamudu, Anjouan<br />
                      Comores
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="text-emerald-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contact@afam-mutsamudu.org</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Phone className="text-emerald-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                    <p className="text-gray-600">+269 XXX XX XX</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100">
              <h3 className="font-semibold text-emerald-900 mb-2">Horaires d'ouverture</h3>
              <p className="text-emerald-800 text-sm">
                Lundi - Vendredi: 9h00 - 17h00<br />
                Samedi: 9h00 - 13h00<br />
                Dimanche: Fermé
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-emerald-50 flex flex-col justify-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rejoignez-nous</h2>
            <p className="text-gray-600 mb-4">
              Pour toute demande d'adhésion ou d'information, contactez-nous directement sur nos réseaux.
            </p>

            <a
              href="https://wa.me/269XXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-6 py-4 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] transition-colors font-medium text-lg"
            >
              <Phone size={24} className="mr-3" />
              Contacter sur WhatsApp
            </a>

            <a
              href="https://www.facebook.com/p/AFAM-100088315476380/?locale=fr_FR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-6 py-4 bg-[#1877F2] text-white rounded-lg hover:bg-[#166fe5] transition-colors font-medium text-lg"
            >
              <svg className="w-6 h-6 mr-3 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Suivre sur Facebook
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
