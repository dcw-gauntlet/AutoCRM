import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  TextField,
  Paper,
  MenuItem,
  CircularProgress
} from '@mui/material';

interface TagProps {
  existingTags: string[];
  onTagSelect: (tag: string) => void;
}

export const Tag: React.FC<TagProps> = ({ existingTags, onTagSelect }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (input.trim()) {
      const filtered = existingTags.filter(tag => 
        tag.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input, existingTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleTagSelect = async (selectedTag: string) => {
    onTagSelect(selectedTag);
    setInput('');
    setSuggestions([]);
  };

  const handleCreateNewTag = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ tag: input.trim() }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        onTagSelect(data.tag);
        setInput('');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error creating new tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <TextField
        fullWidth
        size="small"
        value={input}
        onChange={handleInputChange}
        placeholder="Enter a tag..."
        disabled={isLoading}
      />
      
      {suggestions.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            mt: 0.5,
            maxHeight: '200px',
            overflow: 'auto'
          }}
        >
          {suggestions.map((tag) => (
            <MenuItem
              key={tag}
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </MenuItem>
          ))}
        </Paper>
      )}

      {input && !suggestions.length && !isLoading && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            mt: 0.5
          }}
        >
          <MenuItem
            onClick={handleCreateNewTag}
            sx={{ color: 'primary.main' }}
          >
            Create new tag: "{input}"
          </MenuItem>
        </Paper>
      )}

      {isLoading && (
        <CircularProgress
          size={20}
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
      )}
    </div>
  );
};
