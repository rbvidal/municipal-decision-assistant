package com.cognitera.platform.observability.tracing;

import io.micrometer.tracing.Tracer;
import io.micrometer.tracing.annotation.NewSpan;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * AOP aspect that creates custom spans for key AI pipeline methods.
 *
 * <p>Instruments the main decision pipeline entry points:
 * AiService.answer(), hybrid retrieval, and RuleEngine evaluation.
 * Uses Micrometer Tracing's declarative span API.
 */
@Aspect
@Component
public class PipelineTracingAspect {

    private static final Logger log = LoggerFactory.getLogger(PipelineTracingAspect.class);

    private final Tracer tracer;

    public PipelineTracingAspect(Tracer tracer) {
        this.tracer = tracer;
    }

    /** Wraps AiService.answer() in a top-level "decision.pipeline" span. */
    @Around("execution(* com.cognitera.platform.ai.application.AiService.answer(..))")
    public Object traceDecisionPipeline(ProceedingJoinPoint joinPoint) throws Throwable {
        var span = tracer.nextSpan().name("decision.pipeline").start();
        try (var ws = tracer.withSpan(span)) {
            span.event("pipeline.start");
            Object result = joinPoint.proceed();
            span.event("pipeline.complete");
            return result;
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }

    /** Wraps hybrid retrieval in a "retrieval.hybrid" span. */
    @Around("execution(* com.cognitera.platform.ai.api.RetrievalAugmentationService.retrieve(..))")
    public Object traceRetrieval(ProceedingJoinPoint joinPoint) throws Throwable {
        var span = tracer.nextSpan().name("retrieval.hybrid").start();
        try (var ws = tracer.withSpan(span)) {
            return joinPoint.proceed();
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }

    /** Wraps RuleEngine evaluation in "rule.engine" span. */
    @Around("execution(* com.cognitera.platform.ai.application.RuleEngine.evaluate*(..))")
    public Object traceRuleEngine(ProceedingJoinPoint joinPoint) throws Throwable {
        var span = tracer.nextSpan().name("rule.engine.evaluate").start();
        try (var ws = tracer.withSpan(span)) {
            return joinPoint.proceed();
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
