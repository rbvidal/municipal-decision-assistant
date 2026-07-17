package com.cognitera.platform.search.application;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configuration properties for hybrid retrieval fusion. */
@ConfigurationProperties(prefix = "platform.search.retrieval")
public class RetrievalProperties {

    /** Weight for keyword search results in fusion (0.0–1.0). */
    private double keywordWeight = 0.40;

    /** Weight for vector search results in fusion (0.0–1.0). */
    private double vectorWeight = 0.40;

    /** Weight for confidence score in fusion (0.0–1.0). */
    private double confidenceWeight = 0.20;

    public double getKeywordWeight() {
        return keywordWeight;
    }

    public void setKeywordWeight(double keywordWeight) {
        this.keywordWeight = keywordWeight;
    }

    public double getVectorWeight() {
        return vectorWeight;
    }

    public void setVectorWeight(double vectorWeight) {
        this.vectorWeight = vectorWeight;
    }

    public double getConfidenceWeight() {
        return confidenceWeight;
    }

    public void setConfidenceWeight(double confidenceWeight) {
        this.confidenceWeight = confidenceWeight;
    }
}
