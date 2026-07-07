package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.model.RetrievalPlan.Domain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Domain-first document filter. Uses the weighted DomainClassifier
 * to determine the domain, then filters document titles to only
 * include those matching the domain.
 *
 * <p>A procurement question must never receive travel-expense regulations.
 */
@Component
public class DomainGate {

    private static final Logger log = LoggerFactory.getLogger(DomainGate.class);

    private final DomainClassifier classifier;

    public DomainGate(DomainClassifier classifier) {
        this.classifier = classifier;
    }

    /**
     * Filters document titles to only those matching the detected domain.
     */
    public FilterResult filter(String query, List<String> documentTitles) {
        Domain domain = classifier.classifySimple(query);
        return filterByDomain(domain, documentTitles);
    }

    public FilterResult filterByDomain(Domain domain, List<String> documentTitles) {
        Set<String> accepted = new LinkedHashSet<>();
        Set<String> rejected = new LinkedHashSet<>();

        for (String title : documentTitles) {
            if (accepts(domain, title)) {
                accepted.add(title);
            } else {
                rejected.add(title);
            }
        }

        log.info("DomainGate [{}]: {} accepted, {} rejected", domain, accepted.size(), rejected.size());
        if (!rejected.isEmpty() && rejected.size() <= 5) {
            log.info("DomainGate rejected: {}", String.join(", ", rejected));
        }

        return new FilterResult(domain, List.copyOf(accepted), List.copyOf(rejected));
    }

    private boolean accepts(Domain domain, String title) {
        if (domain == Domain.GENERAL || title == null) return true;
        String lower = title.toLowerCase();
        return switch (domain) {
            case PROCUREMENT -> hasAny(lower, "vergab", "beschaffung", "gwb", "vgv", "uvgo",
                    "berlavg", "vob", "av §", "ausschreibung", "direktauftrag",
                    "vergabeplattform", "lieferung", "rahmenvertrag", "lho", "einkauf");
            case BUILDING -> hasAny(lower, "bau", "bauo", "baugb", "baunvo", "bauvorlv",
                    "abstands", "schneller-bauen", "garage", "carport",
                    "baugenehmigung", "bebauungsplan", "grundstück");
            case HR -> hasAny(lower, "tv-l", "tvö", "entgelt", "urlaub", "urlvo",
                    "arbeitszeit", "azvo", "homeoffice", "mobiles arbeiten",
                    "it-sicherheit", "beschaffungsordnung intern");
            case TRAVEL -> hasAny(lower, "reisekosten", "brkg", "lrkg", "dienstreise",
                    "trennungsgeld", "umzug", "fahrtkosten", "kilometer");
            case GENERAL -> true;
        };
    }

    private boolean hasAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }

    public record FilterResult(
            Domain domain,
            List<String> accepted,
            List<String> rejected
    ) {}
}
