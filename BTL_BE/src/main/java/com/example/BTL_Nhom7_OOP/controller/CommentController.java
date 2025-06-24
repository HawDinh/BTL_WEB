package com.example.BTL_Nhom7_OOP.controller;

import com.example.BTL_Nhom7_OOP.dto.request.CommentRequest;
import com.example.BTL_Nhom7_OOP.dto.response.CommentDTO;
import com.example.BTL_Nhom7_OOP.entity.Comment;
import com.example.BTL_Nhom7_OOP.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @PostMapping("/{id}")
    public ResponseEntity<CommentDTO> createComment(@PathVariable int id,@RequestBody CommentRequest commentRequest) {
        Comment comment = new Comment();
        comment.setName(commentRequest.getName());
        comment.setContent(commentRequest.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        Comment createdComment = commentService.createComment(comment, id);
        return ResponseEntity.ok(CommentDTO.fromEntity(createdComment));
    }

    @GetMapping("/get_all_comment_by_articleId/{id}")
    public ResponseEntity<List<CommentDTO>> getAllCommentsByArticleId(@PathVariable int id) {
        List<Comment> comments = commentService.getAllCommentsByArticleId(id);
        List<CommentDTO> commentDTOS = new ArrayList<>();
        for (Comment comment : comments) {
            commentDTOS.add(CommentDTO.fromEntity(comment));
        }
        return ResponseEntity.ok(commentDTOS);
    }

    @PutMapping("/update_comment/{id}")
    public ResponseEntity<CommentDTO> updateComment(@PathVariable int id, @RequestBody CommentRequest commentRequest) {
        Comment comment = commentService.getCommentById(id);
        comment.setContent(commentRequest.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        Comment updatedComment = commentService.updateComment(comment);
        return ResponseEntity.ok(CommentDTO.fromEntity(updatedComment));
    }

    @DeleteMapping("/delete_comment/{id}")
    public ResponseEntity<String> deleteComment(@PathVariable int id) {
        commentService.deleteCommentById(id);
        return ResponseEntity.ok("Đã xóa thành công bình luận với ID: " + id);
    }
}
