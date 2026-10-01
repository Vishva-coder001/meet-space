package com.meetspace.controller;
import com.meetspace.dto.*; import com.meetspace.dto.AuthDtos.*; import com.meetspace.security.UserPrincipal; import com.meetspace.service.AuthService; import jakarta.servlet.http.*; import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; import org.springframework.security.core.context.*; import org.springframework.security.web.context.*; import org.springframework.security.web.csrf.CsrfToken; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {private final AuthService auth; private final SecurityContextRepository contexts=new HttpSessionSecurityContextRepository();public AuthController(AuthService a){auth=a;}
 @PostMapping("/register") ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest r){auth.register(r);return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Account created. Check your email to verify the account.",null));}
 @PostMapping("/login") ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest r,HttpServletRequest req,HttpServletResponse res){var p=auth.login(r);var c=SecurityContextHolder.createEmptyContext();c.setAuthentication(new UsernamePasswordAuthenticationToken(p,null,p.authorities()));contexts.saveContext(c,req,res);return ApiResponse.ok("Signed in",new AuthResponse(auth.current(p)));}
 @PostMapping("/logout") ApiResponse<Void> logout(HttpServletRequest r){var s=r.getSession(false);if(s!=null)s.invalidate();SecurityContextHolder.clearContext();return ApiResponse.ok("Signed out",null);}
 @PostMapping("/verify-email") ApiResponse<Void> verify(@Valid @RequestBody TokenRequest r){auth.verify(r.token());return ApiResponse.ok("Email verified",null);}
 @PostMapping("/forgot-password") ApiResponse<Void> forgot(@Valid @RequestBody ForgotPasswordRequest r){auth.forgot(r);return ApiResponse.ok("If an active account exists, reset instructions will be sent when email delivery is enabled.",null);}
 @PostMapping("/reset-password") ApiResponse<Void> reset(@Valid @RequestBody ResetPasswordRequest r){auth.reset(r);return ApiResponse.ok("Password reset",null);}
 @GetMapping("/me") ApiResponse<UserResponse> me(@org.springframework.security.core.annotation.AuthenticationPrincipal Object ignored){var a=SecurityContextHolder.getContext().getAuthentication();if(a==null||!(a.getPrincipal() instanceof UserPrincipal p))throw new com.meetspace.exception.ApiException(HttpStatus.UNAUTHORIZED,"AUTH_REQUIRED","Authentication is required");return ApiResponse.ok("Authenticated user",auth.current(p));}
 @GetMapping("/csrf")
ApiResponse<Void> csrf(CsrfToken token) {
    token.getToken();
    return ApiResponse.ok("CSRF cookie issued", null);
}
}
