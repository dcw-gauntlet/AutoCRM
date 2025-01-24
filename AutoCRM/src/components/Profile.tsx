import { useState, useEffect, ChangeEvent, memo, useCallback } from 'react';
import { 
    Paper, 
    Stack, 
    TextField, 
    Button, 
    Typography, 
    Avatar,
    CircularProgress
} from '@mui/material';
import { AutoCRM, User, UserRole } from '../AutoCRM';
import { getRoleColor, getInitials } from '../utils';

interface ProfileProps {
    autoCRM: AutoCRM;
    currentUser: User | null;
}

export function Profile({ autoCRM, currentUser }: ProfileProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [userData, setUserData] = useState<Partial<User>>({
        email: currentUser?.email || '',
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        role: currentUser?.role || UserRole.customer,
        id: currentUser?.id || '',
        profile_picture_url: currentUser?.profile_picture_url,
        friendly_name: currentUser?.friendly_name || ''
    });

    // Update userData when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setUserData({
                email: currentUser.email || '',
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                role: currentUser.role || UserRole.customer,
                id: currentUser.id || '',
                profile_picture_url: currentUser.profile_picture_url,
                friendly_name: currentUser.friendly_name || ''
            });
        }
    }, [currentUser]);

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        setUploadingImage(true);
        try {
            const publicUrl = await autoCRM.uploadProfilePicture(currentUser.id, file);
            setUserData(prev => ({
                ...prev,
                profile_picture_url: publicUrl
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            await autoCRM.upsertUser(userData as User);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Stack spacing={3}>
                <Typography variant="h4" gutterBottom>
                    Profile
                </Typography>

                <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center"
                    justifyContent="center"
                >
                    <Avatar
                        src={userData.profile_picture_url}
                        sx={{ 
                            width: 100, 
                            height: 100,
                            bgcolor: getRoleColor(userData.role as UserRole),
                            border: `3px solid ${getRoleColor(userData.role as UserRole)}`
                        }}
                    >
                        {getInitials(userData.first_name || '', userData.last_name || '')}
                    </Avatar>
                    <Button
                        variant="outlined"
                        component="label"
                        disabled={uploadingImage}
                    >
                        {uploadingImage ? <CircularProgress size={24} /> : 'Upload Picture'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </Button>
                </Stack>

                <TextField
                    label="Friendly Name"
                    value={userData.friendly_name || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, friendly_name: e.target.value }))}
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                    helperText="This is how you'll appear to other users"
                />

                <TextField
                    label="Email"
                    value={userData.email || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                />

                <TextField
                    label="First Name"
                    value={userData.first_name || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, first_name: e.target.value }))}
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                />

                <TextField
                    label="Last Name"
                    value={userData.last_name || ''}
                    onChange={(e) => setUserData(prev => ({ ...prev, last_name: e.target.value }))}
                    variant="outlined"
                    fullWidth
                    autoComplete="off"
                />

                <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
            </Stack>
        </Paper>
    );
}