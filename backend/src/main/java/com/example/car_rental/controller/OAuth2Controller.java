package com.example.car_rental.controller;

import com.example.car_rental.dto.response.TokenResponse;
import com.example.car_rental.service.AuthenticationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final AuthenticationService authenticationService;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private ResponseEntity<String> buildBridgePage(String eventType, String jsonDataOrNull, String messageOrNull) {
        String safeFrontendUrl = frontendUrl.replace("'", "\\'");
        String safeMessage = messageOrNull == null ? "" : messageOrNull.replace("\\", "\\\\").replace("'", "\\'");
        String dataScriptPart = jsonDataOrNull == null ? "null" : jsonDataOrNull;

        String html = """
                <!doctype html>
                <html lang=\"en\">
                <head>
                    <meta charset=\"utf-8\" />
                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
                    <title>Google Login</title>
                </head>
                <body>
                <script>
                    (function () {
                        var payload = {
                            type: '%s',
                            data: %s,
                            message: '%s'
                        };

                        if (window.opener && !window.opener.closed) {
                            window.opener.postMessage(payload, '%s');
                            window.close();
                            return;
                        }

                        window.location.replace('%s');
                    })();
                </script>
                </body>
                </html>
                """.formatted(eventType, dataScriptPart, safeMessage, safeFrontendUrl, safeFrontendUrl);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }

    @GetMapping("/success")
    public ResponseEntity<String> success(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return buildBridgePage("GOOGLE_AUTH_ERROR", null, "OAuth2 user not found");
        }

        try {
            TokenResponse tokenResponse = authenticationService.authenticateGoogleUser(oauth2User);
            String tokenJson = objectMapper.writeValueAsString(tokenResponse);
            return buildBridgePage("GOOGLE_AUTH_SUCCESS", tokenJson, "Google login success");
        } catch (IllegalArgumentException ex) {
            return buildBridgePage("GOOGLE_AUTH_ERROR", null, ex.getMessage());
        } catch (IllegalStateException ex) {
            return buildBridgePage("GOOGLE_AUTH_ERROR", null, ex.getMessage());
        } catch (JsonProcessingException ex) {
            return buildBridgePage("GOOGLE_AUTH_ERROR", null, "Cannot process login response");
        }
    }

    @GetMapping("/failure")
    public ResponseEntity<String> failure() {
        return buildBridgePage("GOOGLE_AUTH_ERROR", null, "Google login failed");
    }
}
