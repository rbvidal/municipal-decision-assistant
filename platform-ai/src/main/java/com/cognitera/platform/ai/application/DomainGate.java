package com.cognitera.platform.ai.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.function.Predicate;

/**
 * Mandatory domain gate that filters retrieval results before they reach
 * the LLM. A procurement question must never receive travel-expense
 * regulations, and vice versa.
 *
 * <p>Domain detection follows the same rules as the reranker's domain
 * detection for consistency.
 */
@Component
public class DomainGate {

    private static final Logger log = LoggerFactory.getLogger(DomainGate.class);

    /** Detected domain with its document acceptance predicate. */
    public enum Domain {
        PROCUREMENT(title -> hasAny(title,
                "vergab", "beschaffung", "gwb", "vgv", "uvgo", "berlavg", "vob", "av §",
                "ausschreibung", "direktauftrag", "vergabeplattform", "lieferung", "rahmenvertrag")),
        BUILDING(title -> hasAny(title,
                "bau", "bauo", "baugb", "baunvo", "bauvorlv", "abstands", "schneller-bauen",
                "garage", "carport", "baugenehmigung", "bebauungsplan")),
        HR(title -> hasAny(title,
                "tv-l", "tvö", "entgelt", "urlaub", "urlvo", "reisekosten", "brkg", "lrkg",
                "arbeitszeit", "azvo", "homeoffice", "mobiles arbeiten", "dienstreise",
                "it-sicherheit", "beschaffungsordnung intern", "trennungsgeld")),
        GENERAL(title -> true); // accepts everything

        private final Predicate<String> filter;

        Domain(Predicate<String> filter) { this.filter = filter; }

        public boolean accepts(String documentTitle) {
            return documentTitle == null || filter.test(documentTitle.toLowerCase());
        }
    }

    /**
     * Detects the administrative domain from the query text.
     */
    public Domain detect(String query) {
        String lower = query.toLowerCase();
        if (hasAny(lower, "beschaffung", "vergabe", "ausschreibung", "lieferung",
                "rahmenvertrag", "direktauftrag", "vergabeverfahren", "beschaffen",
                "einkauf", "lieferant", "angebot", "auftragswert", "schwellenwert",
                "vergabevermerk", "angebotsvergleich", "verhandlungsvergabe",
                "beschränkte ausschreibung", "öffentliche ausschreibung",
                "vergaberecht", "gwb", "vgv", "uvgo", "vob", "berlavg")) {
            return Domain.PROCUREMENT;
        }
        if (hasAny(lower, "bauantrag", "baugenehmigung", "garage", "carport",
                "abstandsfläche", "abstandsflächen", "bebauungsplan", "baugenehmigungsverfahren",
                "bauordnungsrecht", "bauvorlageberechtigung", "baulast",
                "einfamilienhaus", "wohngebäude", "grenzbebauung", "geschossflächenzahl",
                "grundflächenzahl", "geschosswohnungsbau", "baunvo", "bauvorlv",
                "bauo", "baugb", "erschließung", "nutzungsänderung",
                "bauvoranfrage", "vorbescheid", "teilungsgenehmigung")) {
            return Domain.BUILDING;
        }
        if (hasAny(lower, "urlaub", "tv-l", "tvö", "dienstreise", "arbeitszeit",
                "entgeltgruppe", "tarifvertrag", "personalrat", "kündigung",
                "befristung", "teilzeit", "elternzeit", "reisekosten",
                "trennungsgeld", "umzugskosten", "beurteilung", "beförderung",
                "stellenausschreibung", "homeoffice", "mobiles arbeiten",
                "dienstvereinbarung", "gehalt", "vergütung", "lohn", "eg ")) {
            return Domain.HR;
        }
        return Domain.GENERAL;
    }

    /**
     * Filters a list of document titles, keeping only those matching the domain.
     * Returns the list of accepted titles.
     */
    public Set<String> filterDocuments(Domain domain, List<String> documentTitles) {
        Set<String> accepted = new LinkedHashSet<>();
        Set<String> rejected = new LinkedHashSet<>();
        for (String title : documentTitles) {
            if (domain.accepts(title)) {
                accepted.add(title);
            } else {
                rejected.add(title);
            }
        }
        if (!rejected.isEmpty()) {
            log.info("DomainGate [{}]: rejected {} documents: {}", domain,
                    rejected.size(), String.join(", ", rejected));
        }
        return accepted;
    }

    private static boolean hasAny(String text, String... terms) {
        for (String t : terms) if (text.contains(t)) return true;
        return false;
    }
}
