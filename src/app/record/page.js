'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './recorder.module.css';
import Recorder from './Recorder';
import { Client, fql } from "fauna";
import { useEffect } from 'react';

export default function Record() {
    const userInfo = JSON.parse(localStorage?.getItem("video-sharing-app"));
    const router = useRouter();

    useEffect(() => {
        if (!userInfo) {
            alert('You must be logged in to record a video')
            router.push("/login")
        }
    }, [])

    const client = new Client({
        secret: userInfo ? userInfo.key : process.env.NEXT_PUBLIC_FAUNA_KEY,
    });

    const handleRecordedVid = async (blob) => {
        try {
            const newVid = await client.query(fql`
                let user = User.byId(${userInfo.id})
                Video.create({
                    title: ${new Date().toISOString()},
                    author: user
                })
            `)
            console.log('newVid', newVid)

            await fetch(`https://backend.shadidhaque2014.workers.dev/${newVid.data.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/webm',
                    'X-Custom-Auth-Key': 'supersecret'
                },
                body: blob
            })
        } catch (error) {
            console.log('error', error)
            alert('There was an error uploading your video')
        }
    }

    const logout = () => {
        window.localStorage.removeItem("video-sharing-app");
        router.push("/login")
    }

    return (
        <div className={styles.mainWrap}>
            <div className={styles.buttonWrapper}>
                <button onClick={logout}>Logout</button>
            </div>
            <Link href='/'><span className={styles.home}>🏠 Home</span></Link>
            <h1>Record Video</h1>
            <Recorder onRecordedChunks={handleRecordedVid} />
        </div>
    )
}