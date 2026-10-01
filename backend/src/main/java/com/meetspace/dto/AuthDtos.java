package com.meetspace.dto;
import jakarta.validation.constraints.*;
import java.util.UUID;
public final class AuthDtos {
 private AuthDtos() {}
 public record RegisterRequest(@NotBlank @Size(max=50) String employeeId, @NotBlank @Size(max=200) String fullName, @NotBlank @Size(max=100) String department, @NotBlank @Email @Size(max=320) String email, @NotBlank @Size(min=12,max=72) String password) {}
 public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
 public record TokenRequest(@NotBlank String token) {}
 public record ForgotPasswordRequest(@NotBlank @Email String email) {}
 public record ResetPasswordRequest(@NotBlank String token, @NotBlank @Size(min=12,max=72) String password) {}
 public record UserResponse(UUID id, String email, String role, boolean emailVerified) {}
 public record AuthResponse(UserResponse user) {}
}