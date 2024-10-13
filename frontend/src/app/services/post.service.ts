import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from './auth.service'; // Importe o AuthService

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:3000/api/posts';

  constructor(private http: HttpClient, private authService: AuthService) {} // Injete AuthService

  // Método para obter o token
  private getToken(): string | null {
    return localStorage.getItem('token'); // Certifique-se de recuperar o token correto
  }

  // Método para criar um post
  createPost(post: Post): Observable<Post> {
    console.log('Post a ser criado:', post); // Adicione este log para depuração
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getToken()}`
    );

    return this.http.post<Post>(this.apiUrl, post, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao criar post:', error);
        return throwError(() => new Error('Erro ao criar post.'));
      })
    );
  }

  getPosts(): Observable<Post[]> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post[]>(this.apiUrl, { headers }).pipe(
      map((posts) => {
        // Processar comentários nos posts
        posts.forEach((post) => {});

        // Se o usuário estiver logado, retorne todos os posts
        if (this.isLoggedIn()) {
          return posts.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA; // Ordenação decrescente
          });
        } else {
          // Retornar apenas posts públicos e ordená-los
          return posts
            .filter((post) => post.visibility === 'public')
            .sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA; // Ordenação decrescente
            });
        }
      })
    );
  }

  // Método para buscar um post específico pelo ID
  getPostById(postId: number): Observable<Post> {
    const token = this.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    return this.http.get<Post>(`${this.apiUrl}/${postId}`, { headers });
  }

  // Método para buscar posts privados de um usuário
  getPrivatePosts(userId: number): Observable<Post[]> {
    const token = this.getToken();
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclua o token
      },
    });
  }

  // Método para atualizar um post
  updatePost(postId: number, post: Post): Observable<Post> {
    const token = this.getToken(); // Certifique-se de que o token está sendo obtido corretamente
    return this.http.put<Post>(`${this.apiUrl}/${postId}`, post, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho
      },
    });
  }

  // Método para deletar um post
  deletePost(postId: number): Observable<void> {
    const token = this.getToken();
    return this.http.delete<void>(`${this.apiUrl}/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Inclua o token
      },
    });
  }

  // Método auxiliar para verificar se o usuário está logado
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null; // Verifique se há token de acesso
  }
}
