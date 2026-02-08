'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Post {
    id: string | number;
    title: string;
    image_url?: string | null;
    category?: string;
    created_at: string;
    event_date?: string | null;
    excerpt?: string | null;
    content?: string | null;
}

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <article
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-emerald-50 flex flex-col md:flex-row"
        >
            {/* Image Thumbnail */}
            {post.image_url && !imageError && (
                <div className="md:w-1/3 h-48 md:h-auto bg-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={() => setImageError(true)}
                    />
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                        {post.category || 'Actualité'}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                        <Calendar size={14} className="mr-1" />
                        {new Date(post.event_date || post.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2 md:line-clamp-3 flex-1">
                    {post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : '')}
                </p>
                <Link
                    href={`/articles/${post.id}`}
                    className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mt-auto"
                >
                    Lire la suite
                    <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </article>
    );
}
