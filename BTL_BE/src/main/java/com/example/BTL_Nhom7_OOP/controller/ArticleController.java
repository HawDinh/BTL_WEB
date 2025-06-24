package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.request.ArticleRequest;
import com.example.BTL_Nhom7_OOP.dto.response.ArticleDTO;
import com.example.BTL_Nhom7_OOP.entity.Article;
import com.example.BTL_Nhom7_OOP.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://127.0.0.1:5501", "http://localhost:5500", "http://localhost:5501"}, allowCredentials = "true")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @PostMapping
    public ResponseEntity<ArticleDTO> createArticle(@RequestBody ArticleRequest articleRequest) {
        Article article = new Article();
        article.setTitle(articleRequest.getTitle());
        article.setContent(articleRequest.getContent());
        article.setAuthor(articleRequest.getAuthor());
        article.setCreatedAt(LocalDateTime.now());
        Article createdArticle = articleService.createArticle(article);
        return ResponseEntity.ok(ArticleDTO.fromArticle(createdArticle));
    }

    @GetMapping("/get_article_by_id/{id}")
    public ResponseEntity<ArticleDTO> getArticleById(@PathVariable int id) {
        Article article = articleService.getArticleById(id);
        return ResponseEntity.ok(ArticleDTO.fromArticle(article));
    }

    @GetMapping("/get_all_article")
    public ResponseEntity<List<ArticleDTO>> getAllArticle() {
        List<Article> articles = articleService.getAllArticles();
        List<ArticleDTO> articleDTOS = new ArrayList<>();
        for (Article article : articles) {
            articleDTOS.add(ArticleDTO.fromArticle(article));
        }
        return ResponseEntity.ok(articleDTOS);
    }

    @GetMapping("/get_article_by_title/{title}")
    public ResponseEntity<List<ArticleDTO>> getArticleByTitle(@PathVariable String title) {
        List<Article> articles = articleService.getArticleByTitle(title);
        List<ArticleDTO> articleDTOS = new ArrayList<>();
        for (Article article : articles) {
            articleDTOS.add(ArticleDTO.fromArticle(article));
        }
        return ResponseEntity.ok(articleDTOS);
    }

    @GetMapping("/get_article_by_author/{author}")
    public ResponseEntity<List<ArticleDTO>> getArticleByAuthor(@PathVariable String author) {
        List<Article> articles = articleService.getArticleByAuthor(author);
        List<ArticleDTO> articleDTOS = new ArrayList<>();
        for (Article article : articles) {
            articleDTOS.add(ArticleDTO.fromArticle(article));
        }
        return ResponseEntity.ok(articleDTOS);
    }

    @PutMapping("/update_article/{id}")
    public ResponseEntity<ArticleDTO> updateArticle(@PathVariable int id, @RequestBody ArticleRequest articleRequest) {
        Article article = articleService.getArticleById(id);
        article.setTitle(articleRequest.getTitle());
        article.setContent(articleRequest.getContent());
        article.setAuthor(articleRequest.getAuthor());
        article.setUpdatedAt(LocalDateTime.now());
        Article updatedArticle = articleService.updateArticle(article);
        return ResponseEntity.ok(ArticleDTO.fromArticle(updatedArticle));
    }

    @DeleteMapping("/delete_article/{id}")
    public ResponseEntity<String> deleteArticle(@PathVariable int id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok("Đã xóa thành công bài viết với ID: " + id);
    }

    @GetMapping("/count")
    public long countArticles() {
        return articleService.getAllArticles().size();
    }
}
