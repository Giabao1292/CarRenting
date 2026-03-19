package com.example.car_rental.exception;

import com.example.car_rental.exception.ResourceNotFoundException;
import io.jsonwebtoken.JwtException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Date;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidationError(MethodArgumentNotValidException ex, WebRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Lỗi xác thực dữ liệu", message, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        String message = "Không thể chuyển đổi tham số '" + ex.getName() + "' sang kiểu dữ liệu yêu cầu";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Lỗi xác thực dữ liệu", message, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        String message = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Vi phạm ràng buộc", message, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "JSON không đúng định dạng hoặc Enum không hợp lệ", ex.getMostSpecificCause().getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Lỗi tài nguyên", ex.getMessage(), request);
    }

    @ExceptionHandler(JwtException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleJwtException(JwtException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Không được xác thực", ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ", ex.getMessage(), request);
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAuthenticationFailure(AuthenticationException ex, WebRequest request) {

        String message = switch (ex.getClass().getSimpleName()) {
            case "DisabledException" -> "Tài khoản chưa được xác thực (vui lòng kiểm tra email)";
            case "LockedException" -> "Tài khoản đã bị khoá";
            case "AccountExpiredException" -> "Tài khoản đã hết hạn";
            case "CredentialsExpiredException" -> "Thông tin đăng nhập đã hết hạn";
            case "BadCredentialsException" -> "Email hoặc mật khẩu không đúng";
            case "UsernameNotFoundException" -> "Không tìm thấy người dùng";
            default -> "Xác thực thất bại";
        };

        return buildErrorResponse(HttpStatus.FORBIDDEN, "Lỗi xác thực", message, request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Truy cập bị từ chối", "Bạn không có quyền truy cập dữ liệu này", request);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleAllUnhandled(Exception ex, WebRequest request) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống nội bộ", ex.getMessage(), request);
    }

    private ErrorResponse buildErrorResponse(HttpStatus status, String error, String message, WebRequest request) {
        ErrorResponse err = new ErrorResponse();
        err.setTimestamp(new Date());
        err.setStatus(status.value());
        err.setError(error);
        err.setMessage(message);
        err.setPath(request.getDescription(false).replace("uri=", ""));
        return err;
    }
}