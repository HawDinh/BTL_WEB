package com.example.BTL_Nhom7_OOP.service;

import com.example.BTL_Nhom7_OOP.entity.Article;
import com.example.BTL_Nhom7_OOP.exception.ResourceNotFoundException;
import com.example.BTL_Nhom7_OOP.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArticleService {
    @Autowired
    private ArticleRepository articleRepository;

    public Article createArticle(Article article) {
        return articleRepository.save(article);
    }

    public List<Article> getAllArticles() {
        List<Article> articles = articleRepository.findAll();
        if (articles.isEmpty()) {
            throw new ResourceNotFoundException("Không có bài viết nào");
        }
        return articles;
    }

    public Article getArticleById(int id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy"));
    }

    public List<Article> getArticleByTitle(String title) {
        List<Article> articles = articleRepository.findByTitle(title);
        if (articles.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy");
        }
        return articles;
    }

    public List<Article> getArticleByAuthor(String author) {
        List<Article> articles = articleRepository.findByAuthor(author);
        if (articles.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy");
        }
        return articles;
    }

    public Article updateArticle(Article article) {
        return articleRepository.save(article);
    }

    public void deleteArticle(int id) {
        articleRepository.deleteById(id);
    }
}
