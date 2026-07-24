package com.cognitera.platform.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.Locale;

/**
 * Web MVC configuration that sets up locale resolution and a {@code CurrentUriAdvice} for internationalization.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Provides the session-based locale resolver with English as default.
     */
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.GERMAN);
        return resolver;
    }

    /**
     * Registers a locale change interceptor using the {@code lang} query parameter.
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
        lci.setParamName("lang");
        registry.addInterceptor(lci);
    }

    /**
     * Serves static resources from the classpath and falls back to index.html
     * for unmatched paths so the React SPA can handle client-side routing.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location)
                            throws IOException {
                        if (resourcePath == null || resourcePath.isBlank()) {
                            return location.createRelative("index.html");
                        }
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        if (isFileRequest(resourcePath)) {
                            return null;
                        }
                        return location.createRelative("index.html");
                    }
                });
    }

    private static boolean isFileRequest(String resourcePath) {
        int lastSlash = resourcePath.lastIndexOf('/');
        String fileName = lastSlash >= 0 ? resourcePath.substring(lastSlash + 1) : resourcePath;
        return fileName.contains(".");
    }

    /**
     * Controller advice that exposes the current request URI as a model attribute for language switching links.
     */
    @ControllerAdvice
    @Profile("thymeleaf-legacy")
    static class CurrentUriAdvice {

        /**
         * Returns the current request URI with a bare query string ready for lang parameter appending.
         */
        @ModelAttribute("currentUri")
        String currentUri(HttpServletRequest request) {
            String uri = request.getRequestURI();
            String qs = request.getQueryString();
            if (qs != null && !qs.isBlank()) {
                // Strip existing lang param to avoid doubling
                qs = qs.replaceAll("&?lang=[^&]*", "").replaceAll("^&", "");
                if (!qs.isBlank()) {
                    uri = uri + "?" + qs + "&";
                } else {
                    uri = uri + "?";
                }
            } else {
                uri = uri + "?";
            }
            return uri;
        }
    }
}
