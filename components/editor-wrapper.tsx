'use client';

import dynamic from 'next/dynamic';

const EditorClient = dynamic(() => import('./editor-canvas'), {
    ssr: false,
    loading: () => <p>Loading editor...</p>
});

export default function EditorWrapper() {
    return <EditorClient />;
}
