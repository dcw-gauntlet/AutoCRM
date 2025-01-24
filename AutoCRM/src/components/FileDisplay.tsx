import { useState } from 'react';
import { 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    IconButton, 
    Paper,
    Button,
    Stack,
    Typography
} from '@mui/material';
import { 
    InsertDriveFile as FileIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { AutoCRM } from '../AutoCRM';

interface FileDisplayProps {
    ticketId: number;
    autoCRM: AutoCRM;
    files: any[];
    onFilesUpdate: () => void;
    isStaff?: boolean;
}

export function FileDisplay({ ticketId, autoCRM, files, onFilesUpdate, isStaff }: FileDisplayProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await autoCRM.uploadTicketFile(ticketId, file);
            onFilesUpdate();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (fileId: number) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;

        try {
            await autoCRM.deleteTicketFile(fileId);
            onFilesUpdate();
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file');
        }
    };

    return (
        <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
                <Button
                    variant="contained"
                    component="label"
                    disabled={uploading}
                >
                    Upload File
                    <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                    />
                </Button>
                {uploading && <Typography color="text.secondary">Uploading...</Typography>}
            </Stack>

            {files.length > 0 ? (
                <List>
                    {files.map((file) => (
                        <ListItem
                            key={file.id}
                            secondaryAction={
                                <Stack direction="row" spacing={1}>
                                    <IconButton 
                                        edge="end" 
                                        href={file.file_url}
                                        download
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                    {isStaff && (
                                        <IconButton 
                                            edge="end" 
                                            onClick={() => handleDelete(file.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Stack>
                            }
                        >
                            <ListItemIcon>
                                <FileIcon />
                            </ListItemIcon>
                            <ListItemText 
                                primary={file.file_name}
                                secondary={new Date(file.created_at).toLocaleString()}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography color="text.secondary">
                    No files attached to this ticket
                </Typography>
            )}
        </Stack>
    );
} 