import { describe, it, expect } from 'vitest';
import { AutoCRM } from '../AutoCRM';
import { User } from '../AutoCRM';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Debug environment variables
console.log('Environment Variables:', {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_KEY: process.env.VITE_SUPABASE_KEY,
    ENV_FILE_PATH: process.cwd(), // This will show us where Node is looking for files
    ALL_ENV: process.env // This will show all environment variables
});

describe('AutoCRM E2E Tests', () => {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_KEY) {
        throw new Error('Missing required environment variables');
    }

    const autoCRM = new AutoCRM(createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_KEY
    ));

    it('should login and verify user exists in user list', async () => {
        // Login
        await autoCRM.login('david.wadsworth@gauntletai.com', 'test123');
        
        // Get current user
        const currentUser = await autoCRM.getCurrentUser();
        expect(currentUser).toBeTruthy();
        expect(currentUser!.email).toBe('david.wadsworth@gauntletai.com');

        // Get all users and verify current user is in the list
        const allUsers = await autoCRM.getAllUsers();
        expect(allUsers).toBeInstanceOf(Array);
        expect(allUsers.length).toBeGreaterThan(0);
        
        const foundUser = allUsers.find(user => user.email === 'david.wadsworth@gauntletai.com');
        expect(foundUser).toBeTruthy();
        expect(foundUser?.email).toBe(currentUser!.email);
        expect(foundUser?.id).toBe(currentUser!.id);
    });
}); 