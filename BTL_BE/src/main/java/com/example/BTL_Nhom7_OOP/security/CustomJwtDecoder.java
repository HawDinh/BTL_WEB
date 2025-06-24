package com.example.BTL_Nhom7_OOP.security;

import com.example.BTL_Nhom7_OOP.dto.request.IntrospectRequest;
import com.example.BTL_Nhom7_OOP.repository.InvalidatedTokenRepository;
import com.example.BTL_Nhom7_OOP.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Date;
import java.util.Objects;

// Decode token mà ta truyền vào
@Slf4j
@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    public CustomJwtDecoder(InvalidatedTokenRepository invalidatedTokenRepository) {
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // Kiểm tra token có nằm trong danh sách vô hiệu hóa không
            SignedJWT signedJWT = SignedJWT.parse(token);
            String tokenId = signedJWT.getJWTClaimsSet().getJWTID();
            
            // Lấy thông tin về subject và scope
            String subject = signedJWT.getJWTClaimsSet().getSubject();
            String scope = signedJWT.getJWTClaimsSet().getStringClaim("scope");
            
            // Nếu token nằm trong danh sách invalidated token, từ chối
            if (invalidatedTokenRepository.existsById(tokenId)) {
                log.debug("Token đã bị vô hiệu hóa: {}", tokenId);
                throw new JwtException("Token đã bị vô hiệu hóa");
            }
            
            // Kiểm tra hạn sử dụng - bỏ qua kiểm tra với token admin
            boolean isAdminToken = "admin".equals(subject) && scope != null && scope.contains("ADMIN");
            if (!isAdminToken) {
                Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
                if (expiryTime != null && expiryTime.before(new Date())) {
                    log.debug("Token đã hết hạn: {}", tokenId);
                    throw new JwtException("Token đã hết hạn");
                }
            } else {
                log.debug("Cho phép admin token đi qua (bỏ qua kiểm tra hết hạn): {}", subject);
            }
            
        } catch (ParseException e) {
            throw new JwtException("Không thể phân tích token: " + e.getMessage());
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            // Tạo 1 secret key
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder
                    .withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }

        // Giải mã token và trả về
        return nimbusJwtDecoder.decode(token);
    }
}