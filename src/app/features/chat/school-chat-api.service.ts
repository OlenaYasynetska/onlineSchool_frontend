import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatOpenResponse {
  conversationId: string;
}

export interface ChatMessage {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
}

export interface ChatConversationSummary {
  id: string;
  peerEntityId: string;
  peerKind: 'teacher' | 'student';
  peerDisplayName: string;
  lastMessagePreview: string;
  lastMessageAt: string;
}

@Injectable({ providedIn: 'root' })
export class SchoolChatApiService {
  constructor(private readonly http: HttpClient) {}

  private base(): string {
    return `${environment.apiUrl}/chat`;
  }

  openConversation(params: {
    userId: string;
    peerId: string;
    peerKind: 'teacher' | 'student';
  }): Observable<ChatOpenResponse> {
    const q = new URLSearchParams({
      userId: params.userId,
      peerId: params.peerId.trim(),
      peerKind: params.peerKind,
    });
    return this.http.get<ChatOpenResponse>(`${this.base()}/open?${q.toString()}`);
  }

  listConversations(userId: string): Observable<ChatConversationSummary[]> {
    return this.http.get<ChatConversationSummary[]>(
      `${this.base()}/conversations?userId=${encodeURIComponent(userId)}`,
    );
  }

  listMessages(params: {
    userId: string;
    conversationId: string;
    limit?: number;
    before?: string;
  }): Observable<ChatMessage[]> {
    const q = new URLSearchParams({ userId: params.userId });
    if (params.limit != null) q.set('limit', String(params.limit));
    if (params.before?.trim()) q.set('before', params.before.trim());
    return this.http.get<ChatMessage[]>(
      `${this.base()}/conversations/${encodeURIComponent(params.conversationId)}/messages?${q.toString()}`,
    );
  }

  sendMessage(userId: string, conversationId: string, body: string): Observable<ChatMessage> {
    const q = new URLSearchParams({ userId });
    return this.http.post<ChatMessage>(
      `${this.base()}/conversations/${encodeURIComponent(conversationId)}/messages?${q.toString()}`,
      { body: body.trim() },
    );
  }
}
