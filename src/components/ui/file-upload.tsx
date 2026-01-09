import { useState, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    value?: string;
    onUploadComplete: (url: string) => void;
    className?: string;
    accept?: string;
}

export function FileUpload({ value, onUploadComplete, className, accept = "image/*" }: FileUploadProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            // Assuming api.js handles JSON, but for FormData we might need custom fetch or axios config
            // We'll use fetch directly here to avoid Content-Type header issues with FormData
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            onUploadComplete(data.url);
            toast({
                title: "Muvaffaqiyatli yuklandi",
                description: "Fayl serverga saqlandi"
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Xatolik",
                description: "Fayl yuklashda xatolik yuz berdi",
                variant: "destructive"
            });
            setPreview(value || null); // Revert preview
        } finally {
            setLoading(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreview(null);
        onUploadComplete('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={cn("relative group cursor-pointer", className)} onClick={() => inputRef.current?.click()}>
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />

            <div className={cn(
                "border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden",
                preview ? "border-primary/50" : "hover:border-primary/50 hover:bg-secondary/50",
                "h-48 w-full bg-background/50"
            )}>
                {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : preview ? (
                    <div className="relative w-full h-full group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white mb-2" />
                        </div>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleClear}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors p-4 text-center">
                        <Upload className="w-10 h-10 mb-2" />
                        <span className="text-sm font-medium">Rasm yuklash</span>
                        <span className="text-xs text-muted-foreground/70 mt-1 max-w-[150px]">
                            JPG, PNG yoki GIF (Max 5MB)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
