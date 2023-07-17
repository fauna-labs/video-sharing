'use client'
import Link from 'next/link';
import styles from './recorder.module.css';
import Recorder from './Recorder';

export default function Record() {

    const handleRecordedVid = async (blob) => {
        // TODO: Store video metadata in Fauna
        // TODO: Store video blob in Cloundflare R2 Storage
    }
    return (
        <div className={styles.mainWrap}>
            <Link href='/'><span className={styles.home}>🏠 Home</span></Link>
            <h1>Record Video</h1>
            <Recorder onRecordedChunks={handleRecordedVid} />
        </div>
    )
}