import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Revalidate every 60 seconds
export const revalidate = 60;

// Type pour les événements
interface Event {
  id: string;
  title: string;
  content: string;
  event_date: string;
  category: string | null;
  image_url: string | null;
  excerpt: string | null;
}

function EventCard({ event, isPast = false }: { event: Event; isPast?: boolean }) {
  // Parsing date
  const dateObj = new Date(event.event_date);
  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Fake time since we don't store it yet, or extract from date if stored with time
  // For now assuming full day or TBD
  const formattedTime = dateObj.getHours() !== 0
    ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : 'À définir';

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 flex flex-col ${isPast ? 'border-gray-300 opacity-75' : 'border-emerald-600'
      }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded ${isPast
              ? 'bg-gray-100 text-gray-600'
              : 'bg-emerald-100 text-emerald-700'
            }`}>
            {event.category || 'Événement'}
          </span>
          {!isPast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              À venir
            </span>
          )}
        </div>
        <Link href={`/articles/${event.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
            {event.title}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {event.excerpt || event.content.substring(0, 150) + '...'}
        </p>
      </div>
      <div className="space-y-2 text-sm text-gray-600 mt-auto">
        <div className="flex items-center">
          <Calendar size={16} className="mr-2 text-emerald-600" />
          <span className="capitalize">{formattedDate}</span>
        </div>
        {/*
        <div className="flex items-center">
          <Clock size={16} className="mr-2 text-emerald-600" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={16} className="mr-2 text-emerald-600" />
          <span>Mutsamudu</span>
        </div>
        */}
        <div className="pt-4">
          <Link
            href={`/articles/${event.id}`}
            className="text-emerald-600 font-medium hover:underline text-sm"
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function EventsPage() {
  const today = new Date().toISOString();

  const { data: events, error } = await supabase
    .from('posts')
    .select('*')
    // We assume check for is_event or just rely on event_date not null
    .not('event_date', 'is', null)
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
  }

  const allEvents = events || [];

  // Filter client-side or we could do it in query, but splitting by date is easier here
  const upcomingEvents = allEvents.filter(e => e.event_date >= today);
  const pastEvents = allEvents.filter(e => e.event_date < today).reverse(); // Most recent past first

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos événements</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les événements à venir et revivez les moments forts de nos activités passées
          </p>
        </div>

        {/* Événements à venir */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="mr-2 text-emerald-600" size={28} />
            Événements à venir
          </h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun événement à venir pour le moment.</p>
            </div>
          )}
        </section>

        {/* Événements passés */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="mr-2 text-gray-600" size={28} />
            Événements passés
          </h2>
          {pastEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast={true} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun événement passé à afficher.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
