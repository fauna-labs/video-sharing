'use client'
import Link from 'next/link';
import styles from './recorder.module.css';
import Recorder from './Recorder';
import { Client, fql } from "fauna";

export default function Record() {

    const client = new Client({
        secret: process.env.NEXT_PUBLIC_FAUNA_KEY,
    });

    const handleRecordedVid = async (blob) => {
        console.log('--->', blob)
        const newVid = await client.query(fql`
          Video.create({
            title: ${new Date().toISOString()}
          })
        `)
        console.log('newVid', newVid)
    }
    return (
        <div className={styles.mainWrap}>
            <Link href='/'><span className={styles.home}>🏠 Home</span></Link>
            <h1>Record Video</h1>
            <Recorder onRecordedChunks={handleRecordedVid} />
        </div>
    )
}