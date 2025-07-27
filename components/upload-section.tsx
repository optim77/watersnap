'use client';
import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function UploadSection({
                                          className,
                                          ...props
                                      }: React.ComponentPropsWithoutRef<"div">) {
    const [mediumFile, setMediumFile] = useState<File | null>(null);
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);


    const handleUpload = async () => {
        if (!mediumFile || !watermarkFile) return alert('Select both files!');

        setUploading(true);

        const timestamp = Date.now();
        const userId = (await supabase.auth.getUser()).data.user?.id;

        if (!userId) {
            alert('User not logged in!');
            return;
        }

        const mediumPath = `public/${userId}/mediums/${timestamp}-${mediumFile.name}`;
        const watermarkPath = `public/${userId}/watermarks/${timestamp}-${watermarkFile.name}`;

        const {error: mediumErr} = await supabase.storage
            .from('watersnap')
            .upload(mediumPath, mediumFile);

        const {error: watermarkErr} = await supabase.storage
            .from('watersnap')
            .upload(watermarkPath, watermarkFile);

        if (mediumErr || watermarkErr) {
            alert('Sending error!');
        } else {
            alert('Sent!');
        }

        setUploading(false);
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>

            <Card className="p-4">
                <CardHeader>
                    <CardTitle className="text-2xl">Upload watermark and photo</CardTitle>
                </CardHeader>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-watermark"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload a watermark</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, SVG</p>
                        </div>
                        <input id="dropzone-watermark" type="file" className="hidden"  accept="image/png"
                               onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)}/>
                    </label>
                </div>

                <br/>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-photo"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload a photo</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG</p>
                        </div>
                        <input id="dropzone-photo" type="file" className="hidden" accept="image/*"
                               onChange={(e) => setMediumFile(e.target.files?.[0] || null)}/>
                    </label>
                </div>

                <button
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Processing...' : 'Send'}
                </button>
            </Card>
        </div>
    );
}
