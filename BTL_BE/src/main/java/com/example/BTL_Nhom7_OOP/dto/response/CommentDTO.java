package com.example.BTL_Nhom7_OOP.dto.response;

import com.example.BTL_Nhom7_OOP.entity.Article;
import com.example.BTL_Nhom7_OOP.entity.Comment;

import java.time.LocalDateTime;

public class CommentDTO {
    private int id;
    private String name;
    private String content;
    private Article article;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    public CommentDTO(int id, String name, String content, Article article ,LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.article = article;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Article getArticle() {
        return article;
    }

    public void setArticle(Article article) {
        this.article = article;
    }

    public static CommentDTO fromEntity(Comment comment) {
        if (comment == null) {
            return null;
        }
        return new CommentDTO(comment.getId(), comment.getName(), comment.getContent(), comment.getArticle() ,comment.getCreatedAt(), comment.getUpdatedAt());
    }
}
