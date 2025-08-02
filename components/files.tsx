'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/superbase';
import toast from 'react-hot-toast';
import { ProcessedFileGrid } from "@/components/files/processed-field-grid";
import { FileGrid } from "@/components/files/files-field-grid";
import { Spinner } from "@/components/ui/spinner";
import { FileItem } from "@/components/files/types/file";


export default function MyFiles() {
    const [viewMode, setViewMode] = useState<'processed' | 'edit'>('processed');

    const [mediums, setMediums] = useState<FileItem[]>([]);
    const [watermarks, setWatermarks] = useState<FileItem[]>([]);
    const [processed, setProcessed] = useState<FileItem[]>([]);

    const [selectedMedium, setSelectedMedium] = useState<FileItem | null>(null);
    const [selectedWatermark, setSelectedWatermark] = useState<FileItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;
            await Promise.all([
                loadFiles('processed', setProcessed, user.id),
                loadFiles('mediums', setMediums, user.id),
                loadFiles('watermarks', setWatermarks, user.id),
            ]).then(() => {
                setLoading(false);
            });
        };
        fetchAll();
    }, []);

    const loadFiles = async (
        folder: 'processed' | 'mediums' | 'watermarks',
        setter: (files: FileItem[]) => void,
        uid: string
    ) => {
        const path = `public/${uid}/${folder}`;
        const { data, error } = await supabase.storage.from('watersnap').list(path);

        if (error) {
            toast.error(`Error during loading the folder: ${folder}`);
            return;
        }

        const files = await Promise.all(
            (data || [])
                .filter((f) => f.name.match(/\.(jpe?g|png)$/i))
                .map(async (file) => {
                    const { data: signed } = await supabase.storage
                        .from('watersnap')
                        .createSignedUrl(`${path}/${file.name}`, 60 * 10);
                    return {
                        url: signed?.signedUrl || '',
                        name: file.name,
                        path: `${path}/${file.name}`,
                    };
                })
        );

        setter(files);
    };

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
                        onDelete={(deleted) => setProcessed(prev => prev.filter(p => p.name !== deleted.name))}
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
