'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/superbase';
import { ProcessedFileGrid } from "@/components/files/processed-field-grid";
import { FileGrid } from "@/components/files/files-field-grid";
import { Spinner } from "@/components/ui/spinner";
import { FileItem } from "@/components/files/types/file";
import { throwAlert } from "@/components/utils/throw-alert";

const PAGE_SIZE = 20;

export default function MyFiles() {
    const [viewMode, setViewMode] = useState<'processed' | 'edit'>('processed');

    const [mediums, setMediums] = useState<FileItem[]>([]);
    const [watermarks, setWatermarks] = useState<FileItem[]>([]);
    const [processed, setProcessed] = useState<FileItem[]>([]);

    const [selectedMedium, setSelectedMedium] = useState<FileItem | null>(null);
    const [selectedWatermark, setSelectedWatermark] = useState<FileItem | null>(null);

    const [loading, setLoading] = useState(true);

    const [mediumPage, setMediumPage] = useState(0);
    const [watermarkPage, setWatermarkPage] = useState(0);
    const [processedPage, setProcessedPage] = useState(0);

    const [hasMoreMediums, setHasMoreMediums] = useState(true);
    const [hasMoreWatermarks, setHasMoreWatermarks] = useState(true);
    const [hasMoreProcessed, setHasMoreProcessed] = useState(true);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const uidRef = useRef<string | null>(null);

    const fetchInitialUser = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
            uidRef.current = user.id;
            await Promise.all([
                fetchNextFiles('mediums'),
                fetchNextFiles('watermarks'),
                fetchNextFiles('processed'),
            ]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInitialUser();
    }, []);

    const fetchNextFiles = async (folder: 'processed' | 'mediums' | 'watermarks') => {

        const uid = uidRef.current;
        if (!uid) return;

        const page =
            folder === 'mediums'
                ? mediumPage
                : folder === 'watermarks'
                    ? watermarkPage
                    : processedPage;

        const path = `public/${uid}/${folder}`;
        const { data, error } = await supabase.storage.from('watersnap').list(path);

        if (error) {
            throwAlert(error);
            return;
        }

        const filtered = (data || [])
            .filter((f) => f.name.match(/\.(jpe?g|png)$/i))
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

        const withSignedUrls = await Promise.all(
            pageItems.map(async (file) => {
                const { data: signed } = await supabase.storage
                    .from('watersnap')
                    .createSignedUrl(`${path}/${file.name}`, 600);

                return {
                    url: signed?.signedUrl || '',
                    name: file.name,
                    path: `${path}/${file.name}`,
                    updated_at: file.updated_at,
                };
            })
        );

        if (folder === 'mediums') {
            setMediums(prev => [...prev, ...withSignedUrls]);
            setMediumPage(prev => prev + 1);
            if (pageItems.length < PAGE_SIZE) setHasMoreMediums(false);
        } else if (folder === 'watermarks') {
            setWatermarks(prev => [...prev, ...withSignedUrls]);
            setWatermarkPage(prev => prev + 1);
            if (pageItems.length < PAGE_SIZE) setHasMoreWatermarks(false);
        } else {
            setProcessed(prev => [...prev, ...withSignedUrls]);
            setProcessedPage(prev => prev + 1);
            if (pageItems.length < PAGE_SIZE) setHasMoreProcessed(false);
        }
    };

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                if (viewMode === 'processed' && hasMoreProcessed) {
                    fetchNextFiles('processed');
                } else if (viewMode === 'edit') {
                    if (hasMoreMediums) fetchNextFiles('mediums');
                    if (hasMoreWatermarks) fetchNextFiles('watermarks');
                }
            }
        },
        [viewMode, hasMoreProcessed, hasMoreMediums, hasMoreWatermarks]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => {
            if (observerRef.current) observer.unobserve(observerRef.current);
        };
    }, [handleObserver]);

    const startEditing = () => {
        if (!selectedMedium || !selectedWatermark) return;
        const mediumId = selectedMedium.name.split('.')[0];
        const watermarkId = selectedWatermark.name.split('.')[0];
        window.location.href = `/editor?medium=${mediumId}&watermark=${watermarkId}`;
    };

    return (
        <main className="bg-gray-900 text-white p-6 min-w-[1000px] min-h-[500px]">
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setViewMode('processed')}
                    className={`px-4 py-2 rounded ${viewMode === 'processed' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    📸 Processed
                </button>
                <button
                    onClick={() => setViewMode('edit')}
                    className={`px-4 py-2 rounded ${viewMode === 'edit' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    🖼️ Edit
                </button>
            </div>

            {loading ? (
                <section className="mt-10">
                    <Spinner />
                </section>
            ) : viewMode === 'processed' ? (
                <section>
                    <h2 className="text-xl font-semibold mb-2">Processed images</h2>
                    <ProcessedFileGrid
                        items={processed}
                        showDownload
                        onDelete={(deleted) =>
                            setProcessed(prev => prev.filter(p => p.name !== deleted.name))
                        }
                    />
                </section>
            ) : (
                <section className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 bg-gray-800 rounded-lg p-4 max-h-[900px] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-2">Clear images</h3>
                        <FileGrid
                            items={mediums}
                            selected={selectedMedium}
                            onSelect={setSelectedMedium}
                            onDelete={(deleted) =>
                                setMediums((prev) => prev.filter((p) => p.path !== deleted.path))
                            }
                        />
                    </div>

                    <div className="flex-1 bg-gray-800 rounded-lg p-4 max-h-[900px] overflow-y-auto">
                        <h3 className="text-lg font-medium mb-2">Watermarks</h3>
                        <FileGrid
                            items={watermarks}
                            selected={selectedWatermark}
                            onSelect={setSelectedWatermark}
                            onDelete={(deleted) =>
                                setWatermarks((prev) => prev.filter((p) => p.path !== deleted.path))
                            }
                        />
                    </div>
                </section>
            )}

            <div ref={observerRef} className="h-8 mt-8 flex justify-center items-center">
                {(hasMoreProcessed || hasMoreMediums || hasMoreWatermarks) && <Spinner />}
            </div>

            {viewMode === 'edit' && (
                <div className="text-center mt-6">
                    <button
                        onClick={startEditing}
                        disabled={!selectedMedium || !selectedWatermark}
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white disabled:opacity-40"
                    >
                        Let&#39;s create!
                    </button>
                </div>
            )}
        </main>
    );
}
