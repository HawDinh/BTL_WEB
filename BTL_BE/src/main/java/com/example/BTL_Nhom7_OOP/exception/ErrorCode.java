package com.example.BTL_Nhom7_OOP.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;


@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1010, "Role not existed", HttpStatus.NOT_FOUND),
    USER_ROLE_EXISTED(1011, "User role already existed", HttpStatus.CONFLICT),
    USER_ROLE_NOT_EXISTED(1012, "User role not existed", HttpStatus.NOT_FOUND),
    INVALID_INPUT(1014, "Permission group name cannot be null or empty", HttpStatus.BAD_REQUEST),
    
    // Pet related error codes
    PET_NOT_FOUND(2001, "Không tìm thấy thú cưng", HttpStatus.NOT_FOUND),
    PET_ALREADY_EXISTS(2002, "Thú cưng đã tồn tại", HttpStatus.CONFLICT),
    INVALID_PET_DATA(2003, "Dữ liệu thú cưng không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // Service related error codes
    SERVICE_NOT_FOUND(3001, "Không tìm thấy dịch vụ", HttpStatus.NOT_FOUND),
    SERVICE_ALREADY_EXISTS(3002, "Dịch vụ đã tồn tại", HttpStatus.CONFLICT),
    INVALID_SERVICE_DATA(3003, "Dữ liệu dịch vụ không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // AppointmentService related error codes
    APPOINTMENT_SERVICE_NOT_FOUND(4001, "Không tìm thấy dịch vụ của cuộc hẹn", HttpStatus.NOT_FOUND),
    APPOINTMENT_NOT_FOUND(4002, "Không tìm thấy cuộc hẹn", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(4003, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
