package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.config.AiPipelineProperties;
import com.cognitera.platform.ai.model.AiRequest;
import com.cognitera.platform.ai.model.RetrievalPlan;
import com.cognitera.platform.ai.model.RetrievalPlan.Domain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Plans retrieval once per question. No recursion, no targeted
 * follow-up searches, no missing-role detection.
 *
 * <p>Pipeline:
 * <pre>
 *   Question → Intent → Domain → RetrievalPlan → Execute (once)
 * </pre>
 */
@Component
public class RetrievalPlanner {

    private static final Logger log = LoggerFactory.getLogger(RetrievalPlanner.class);

    private final DomainClassifier domainClassifier;
    private final AiPipelineProperties props;

    public RetrievalPlanner(DomainClassifier domainClassifier, AiPipelineProperties props) {
        this.domainClassifier = domainClassifier;
        this.props = props;
    }

    /**
     * Creates a single retrieval plan for the given question.
     */
    public RetrievalPlan plan(AiRequest request) {
        String question = request.question();
        var domainResult = domainClassifier.classify(question);
        Domain domain = domainResult.primary();

        int maxResults = request.maxRetrievalResults() > 0
                ? Math.min(request.maxRetrievalResults(), 20) : 20;

        RetrievalPlan plan = RetrievalPlan.forDomain(domain, maxResults,
                props.getMaxParagraphsPerSource());

        log.info("RetrievalPlan: domain={} (conf={:.2f}) | strategy={} | maxResults={} | maxChunksPerDoc={} | collections={}",
                plan.primaryDomain(), domainResult.primaryConfidence(),
                plan.retrievalStrategy(), plan.maxResults(),
                plan.maxChunksPerDocument(), plan.eligibleCollections());

        return plan;
    }

    /** Returns the classified domain for a question without creating a full plan. */
    public Domain classifyDomain(String question) {
        return domainClassifier.classify(question).primary();
    }
}
