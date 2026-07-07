package com.cognitera.platform.ai.unit.retrieval;

import com.cognitera.platform.ai.application.DomainClassifier;
import com.cognitera.platform.ai.application.DomainClassifier.DomainResult;
import com.cognitera.platform.ai.model.RetrievalPlan.Domain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Acceptance tests for domain classification. Procurement must never
 * return GENERAL. HR must never classify as PROCUREMENT, etc.
 */
class DomainClassifierTest {

    private DomainClassifier classifier;

    @BeforeEach
    void setUp() {
        classifier = new DomainClassifier();
    }

    // ── Procurement ──

    @Test
    void shouldClassifyProcurementQuestion() {
        DomainResult r = classifier.classify(
                "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?");
        assertEquals(Domain.PROCUREMENT, r.primary());
        assertTrue(r.isStrong(), "Procurement should be strong");
        assertTrue(r.primaryConfidence() > 0.5);
    }

    @Test
    void shouldClassifyBeschaffungAsProcurement() {
        DomainResult r = classifier.classify(
                "Ist eine Beschaffung über 800 Euro ohne vorherige Genehmigung zulässig?");
        assertEquals(Domain.PROCUREMENT, r.primary());
    }

    @Test
    void shouldClassifyVergabeAsProcurement() {
        DomainResult r = classifier.classify("Welche Wertgrenzen gelten für Direktaufträge?");
        assertEquals(Domain.PROCUREMENT, r.primary());
    }

    @Test
    void shouldClassifyAusschreibungAsProcurement() {
        DomainResult r = classifier.classify("Wie schreibe ich eine Lieferung öffentlich aus?");
        assertEquals(Domain.PROCUREMENT, r.primary());
    }

    @Test
    void procurementMustNotBeGeneral() {
        // All of these must be PROCUREMENT, not GENERAL
        String[] queries = {
            "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?",
            "Ist eine Beschaffung über 800 Euro ohne vorherige Genehmigung zulässig?",
            "Welche Wertgrenzen gelten für Direktaufträge?",
            "Wie dokumentiere ich einen Vergabevermerk?",
            "Ab welchem Auftragswert muss eine EU-weite Ausschreibung erfolgen?"
        };
        for (String q : queries) {
            DomainResult r = classifier.classify(q);
            assertNotEquals(Domain.GENERAL, r.primary(),
                    "Query '" + q + "' must not be GENERAL");
        }
    }

    // ── HR ──

    @Test
    void shouldClassifySalaryAsHR() {
        DomainResult r = classifier.classify(
                "Wie hoch ist EG 9 Stufe 3 ab Februar 2025?");
        assertEquals(Domain.HR, r.primary());
    }

    @Test
    void shouldClassifyTVLAsHR() {
        DomainResult r = classifier.classify(
                "Wie hoch ist die Gehaltserhöhung ab Februar 2025 für EG 9 Stufe 3?");
        assertEquals(Domain.HR, r.primary());
    }

    @Test
    void shouldClassifyUrlaubAsHR() {
        DomainResult r = classifier.classify(
                "Kann ich meinen Resturlaub ins nächste Jahr übertragen?");
        assertEquals(Domain.HR, r.primary());
    }

    // ── Travel ──

    @Test
    void shouldClassifyTravelExpenseAsTravel() {
        DomainResult r = classifier.classify(
                "Wie hoch ist die Verpflegungspauschale bei einer 12-stündigen Dienstreise?");
        assertEquals(Domain.TRAVEL, r.primary());
    }

    @Test
    void shouldClassifyReisekostenAsTravel() {
        DomainResult r = classifier.classify(
                "Wie hoch ist das Tagegeld bei einer Dienstreise nach Brüssel?");
        assertEquals(Domain.TRAVEL, r.primary());
    }

    // ── Building ──

    @Test
    void shouldClassifyBuildingPermitAsBuilding() {
        DomainResult r = classifier.classify(
                "Welches Baugenehmigungsverfahren gilt für ein Einfamilienhaus?");
        assertEquals(Domain.BUILDING, r.primary());
    }

    @Test
    void shouldClassifyAbstandsflaecheAsBuilding() {
        DomainResult r = classifier.classify(
                "Welche Abstandsflächen gelten in Berlin?");
        assertEquals(Domain.BUILDING, r.primary());
    }

    // ── Edge cases ──

    @Test
    void genericQuestionShouldBeGeneral() {
        DomainResult r = classifier.classify("Hallo");
        assertEquals(Domain.GENERAL, r.primary());
        assertFalse(r.isStrong());
    }

    @Test
    void shouldProvideSecondaryDomain() {
        DomainResult r = classifier.classify(
                "Dienstreise nach Berlin — wie buche ich ein Hotel und beantrage Urlaub?");
        assertEquals(Domain.TRAVEL, r.primary());
        assertTrue(r.secondary() == Domain.HR || r.secondary() == null);
    }
}
