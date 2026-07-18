package com.cognitera.platform.api.web;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Servlet filter that sanitizes request parameters against XSS attacks.
 * Strips HTML tags and script-injection patterns from query parameters
 * and form-encoded request bodies.
 */
@Component
public class XssSanitizer implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest) {
            chain.doFilter(new XssRequestWrapper(httpRequest), response);
        } else {
            chain.doFilter(request, response);
        }
    }

    /** Wraps HttpServletRequest to sanitize parameter values. */
    private static class XssRequestWrapper extends HttpServletRequestWrapper {

        XssRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            return sanitize(super.getParameter(name));
        }

        @Override
        public String[] getParameterValues(String name) {
            String[] values = super.getParameterValues(name);
            if (values == null) return null;
            String[] sanitized = new String[values.length];
            for (int i = 0; i < values.length; i++) {
                sanitized[i] = sanitize(values[i]);
            }
            return sanitized;
        }

        @Override
        public String getHeader(String name) {
            return sanitize(super.getHeader(name));
        }

        /** Strips dangerous HTML/script patterns from input. */
        static String sanitize(String value) {
            if (value == null || value.isBlank()) return value;
            return value
                    .replace("<script", "")
                    .replace("</script>", "")
                    .replace("javascript:", "")
                    .replace("onload=", "")
                    .replace("onerror=", "")
                    .replace("onclick=", "")
                    .replace("<iframe", "")
                    .replace("<embed", "")
                    .replace("<object", "")
                    .replace("eval(", "")
                    .replace("expression(", "");
        }
    }
}
