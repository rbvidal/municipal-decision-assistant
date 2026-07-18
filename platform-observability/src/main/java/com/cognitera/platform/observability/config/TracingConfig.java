package com.cognitera.platform.observability.config;

import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import org.slf4j.MDC;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;

/**
 * Populates SLF4J MDC with trace_id and span_id for log correlation
 * whenever Micrometer Tracing is on the classpath.
 */
@Configuration
@ConditionalOnClass(Tracer.class)
public class TracingConfig {

    private static final Logger log = LoggerFactory.getLogger(TracingConfig.class);
    private final Tracer tracer;

    public TracingConfig(Tracer tracer) {
        this.tracer = tracer;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void onStartup() {
        log.info("Micrometer Tracing initialized — trace_id and span_id will appear in MDC");
    }

    /**
     * Returns current trace_id for MDC. Called from custom log patterns.
     * Use {@code %X{trace_id}} and {@code %X{span_id}} in logback pattern
     * to include these in every log line.
     */
    public void populateMdcForCurrentSpan() {
        Span current = tracer.currentSpan();
        if (current != null) {
            MDC.put("trace_id", current.context().traceId());
            MDC.put("span_id", current.context().spanId());
        }
    }

    public void clearMdc() {
        MDC.remove("trace_id");
        MDC.remove("span_id");
    }
}
