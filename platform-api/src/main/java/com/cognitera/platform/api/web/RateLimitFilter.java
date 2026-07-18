package com.cognitera.platform.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiting filter.
 *
 * <p>Limits:
 * <ul>
 *   <li>Login: 5 requests per minute per IP</li>
 *   <li>Decision: 10 requests per minute per user</li>
 *   <li>Upload: 20 requests per hour per user</li>
 * </ul>
 * Returns HTTP 429 with Retry-After header when limits are exceeded.
 */
@Component
public class RateLimitFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private final Map<String, RateLimitWindow> loginWindows = new ConcurrentHashMap<>();
    private final Map<String, RateLimitWindow> decisionWindows = new ConcurrentHashMap<>();
    private final Map<String, RateLimitWindow> uploadWindows = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest httpRequest)) {
            chain.doFilter(request, response);
            return;
        }

        String path = httpRequest.getRequestURI();
        String clientKey;

        if (path.equals("/api/auth/login")) {
            clientKey = "ip:" + getClientIp(httpRequest);
            if (!allow(loginWindows, clientKey, 5, 60)) {
                reject((HttpServletResponse) response, 60);
                return;
            }
        } else if (path.startsWith("/api/decision/") && path.contains("/analyze")) {
            clientKey = "user:" + (httpRequest.getUserPrincipal() != null
                    ? httpRequest.getUserPrincipal().getName() : getClientIp(httpRequest));
            if (!allow(decisionWindows, clientKey, 10, 60)) {
                reject((HttpServletResponse) response, 60);
                return;
            }
        } else if (path.equals("/api/documents/upload")) {
            clientKey = "user:" + (httpRequest.getUserPrincipal() != null
                    ? httpRequest.getUserPrincipal().getName() : getClientIp(httpRequest));
            if (!allow(uploadWindows, clientKey, 20, 3600)) {
                reject((HttpServletResponse) response, 3600);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean allow(Map<String, RateLimitWindow> windows, String key,
                          int maxRequests, int windowSeconds) {
        Instant now = Instant.now();
        windows.compute(key, (k, window) -> {
            if (window == null || window.resetTime().isBefore(now)) {
                return new RateLimitWindow(1, now.plusSeconds(windowSeconds));
            }
            return new RateLimitWindow(window.count() + 1, window.resetTime());
        });

        RateLimitWindow current = windows.get(key);
        if (current.count() > maxRequests) {
            log.warn("Rate limit exceeded: key={} count={} max={} window={}s",
                    key, current.count(), maxRequests, windowSeconds);
            return false;
        }
        return true;
    }

    private void reject(HttpServletResponse response, int retryAfterSeconds) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/json");
        response.getWriter().write("""
            {"error":"Zu viele Anfragen","message":"Das Limit wurde überschritten. \
            Bitte versuchen Sie es in %d Sekunden erneut.","status":429}""".formatted(retryAfterSeconds));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private record RateLimitWindow(int count, Instant resetTime) {}
}
