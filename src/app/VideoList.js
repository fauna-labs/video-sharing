'use client'
import Link from 'next/link';

export default function VideoList({ title, videos }) {
    return (
        <div>
            <h1>{title}</h1>
            <div>
                {videos.map((video) => (
                    <div key={video.id}>
                        <Link href={`/video/${video.id}`}>
                            <span>{video.title}</span>
                        </Link>
                    </div>
                ))
                }
            </div>
        </div>
    )
}