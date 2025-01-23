import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TicketMessage } from './types';
import styled from 'styled-components';
import { format } from 'date-fns';

const MessageContainer = styled.div`
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin: 16px 0;
  padding: 16px;
  background-color: #ffffff;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #586069;
  font-size: 0.9em;
`;

const SenderName = styled.span`
  font-weight: 600;
  color: #24292e;
`;

const MessageContent = styled.div`
  line-height: 1.5;
  
  // Style markdown content
  p {
    margin: 0 0 16px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

interface MessageDisplayProps {
  message: TicketMessage;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  return (
    <MessageContainer>
      <MessageHeader>
        <SenderName>{message.sender.full_name || message.sender.email}</SenderName>
        <span>{format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}</span>
      </MessageHeader>
      <MessageContent>
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </MessageContent>
    </MessageContainer>
  );
};
