package com.example.car_rental.service.impl;

import com.example.car_rental.dto.request.LoginRequest;
import com.example.car_rental.dto.request.RegisterRequest;
import com.example.car_rental.dto.request.VerifyRequestDTO;
import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.exception.ResourceNotFoundException;
import com.example.car_rental.model.User;
import com.example.car_rental.model.VerificationToken;
import com.example.car_rental.repository.UserRepository;
import com.example.car_rental.repository.VerificationTokenRepository;
import com.example.car_rental.service.*;
import com.example.car_rental.validation.UserValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    // private final VerificationTokenRepository verificationTokenRepository;
    private final MailService mailService;
    private final UserValidator userValidator;
    private final VerificationTokenService verificationTokenService;
    private final VerificationTokenRepository verificationTokenRepository;

    @Transactional
    @Override
    public TokenResponse authenticate(LoginRequest request) {
        log.info("Starting Authenticate");
        User user = userService.findByEmail(request.getEmail());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        log.info("Ending Authenticate");
        return TokenResponse.builder().accessToken(accessToken).refreshToken(refreshToken).avatar(user.getAvatar()).role(user.getRole()).build();
    }

    @Transactional
    @Override
    public TokenResponse authenticateGoogleUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account does not contain email");
        }

        String googleName = oauth2User.getAttribute("name");
        String fullName = (googleName == null || googleName.isBlank()) ? email : googleName;
        String avatar = oauth2User.getAttribute("picture");
        Instant now = Instant.now();

        User user = userRepository.findUserByEmail(email).map(existingUser -> {
            if (existingUser.getFullName() == null || existingUser.getFullName().isBlank()) {
                existingUser.setFullName(fullName);
            }
            if ((existingUser.getAvatar() == null || existingUser.getAvatar().isBlank()) && avatar != null && !avatar.isBlank()) {
                existingUser.setAvatar(avatar);
            }
            if (!Boolean.TRUE.equals(existingUser.getVerified())) {
                existingUser.setVerified(true);
            }
            existingUser.setUpdatedAt(now);
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setFullName(fullName);
            newUser.setAvatar(avatar);
            newUser.setRole("USER");
            newUser.setVerified(true);
            newUser.setIsDeleted(false);
            newUser.setCreatedAt(now);
            newUser.setUpdatedAt(now);
            return userRepository.save(newUser);
        });

        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new IllegalStateException("User account has been blocked");
        }

        return TokenResponse.builder().accessToken(jwtService.generateToken(user)).refreshToken(jwtService.generateRefreshToken(user)).avatar(user.getAvatar()).role(user.getRole()).build();
    }

    @Override
    public String register(RegisterRequest registerRequest) {
        userValidator.validateEmail(registerRequest.getEmail());
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setRole("USER");
        user.setVerified(false);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setDob(registerRequest.getDateOfBirth());
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return verificationTokenService.saveVerificationToken(registerRequest.getEmail());
    }

    //
    // @Override
    // public TokenResponse refreshToken(String refreshToken) {
    // String username = jwtService.extractUsername(refreshToken, REFRESH_TOKEN);
    // User user = userRepository.findUserByEmail(username).orElseThrow(() -> new
    // ResourceNotFoundException("User not found"));
    // String accessToken = jwtService.generateToken(user);
    // return TokenResponse.builder()
    // .accessToken(accessToken)
    // .refreshToken(refreshToken)
    // .roles(user.getTblUserRoles().stream().map(role ->
    // role.getRole().getRoleName()).collect(Collectors.toList()))
    // .build();
    // }
    //
    @Override
    public TokenResponse verifyTokenRegister(VerifyRequestDTO verifyRequestDTO) {
        VerificationToken token = verificationTokenRepository.findByTokenAndEmailAndExpiryDateIsAfterAndUsed(verifyRequestDTO.getToken(), verifyRequestDTO.getEmail(), Instant.now(), false).orElseThrow(() -> new ResourceNotFoundException("Token không hợp lệ"));
        if (token != null) {
            token.setUsed(true);
            verificationTokenRepository.save(token);
        }
        return userService.saveUser(verifyRequestDTO.getEmail());
    }
    //
    // @Override
    // public void handleForgotPassword(String email) {
    // User user = userRepository.findByEmail(email)
    // .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy email"));
    //
    // String token = UUID.randomUUID().toString();
    //
    // VerificationToken verificationToken = new VerificationToken();
    // verificationToken.setEmail(user.getEmail());
    // verificationToken.setToken(token);
    // verificationToken.setExpiryDate(Instant.now().plusSeconds(15 * 60)); // hết
    // hạn sau 15 phút
    // verificationTokenRepository.save(verificationToken);
    //
    // try {
    // mailService.sendResetPasswordEmail(user.getEmail(), token); // gọi gửi mail
    // reset password
    // } catch (MessagingException e) {
    // throw new RuntimeException("Không thể gửi email đặt lại mật khẩu", e);
    // }
    // }
    //
    // @Override
    // public void resetPassword(String token, String newPassword) {
    // VerificationToken verificationToken =
    // verificationTokenRepository.findByToken(token)
    // .orElseThrow(() -> new ResourceNotFoundException("Token không hợp lệ"));
    //
    // if (verificationToken.getExpiryDate().isBefore(Instant.now())) { // ✅ Dùng
    // Instant
    // throw new RuntimeException("Token đã hết hạn");
    // }
    //
    // User user = userRepository.findByEmail(verificationToken.getEmail())
    // .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng
    // tương ứng với token"));
    //
    // user.setPassword(passwordEncoder.encode(newPassword));
    // userRepository.save(user);
    // verificationTokenRepository.delete(verificationToken);
    // }
    //
    // @Override
    // public String getUsername() {
    // return SecurityContextHolder.getContext().getAuthentication().getName();
    // }
}
