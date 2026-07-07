package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.ContextAssembler;
import com.cognitera.platform.ai.api.FindingHierarchyService;
import com.cognitera.platform.ai.api.ObjectiveAnalysisService;
import com.cognitera.platform.ai.api.SourceOrchestrationService;
import com.cognitera.platform.ai.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Assembles a prompt context including an {@link EvidencePackage} built from
 * retrieval results. The evidence package replaces raw source lists in the
 * prompt with structured, numbered evidence items.
 */
@Component
public class DefaultContextAssembler implements ContextAssembler {

    private final ObjectiveAnalysisService objectiveAnalysisService;
    private final FindingHierarchyService findingHierarchyService;
    private final SourceOrchestrationService sourceOrchestrationService;
    private final EvidencePackageBuilder evidencePackageBuilder;

    public DefaultContextAssembler(ObjectiveAnalysisService objectiveAnalysisService,
                                    FindingHierarchyService findingHierarchyService,
                                    SourceOrchestrationService sourceOrchestrationService,
                                    EvidencePackageBuilder evidencePackageBuilder) {
        this.objectiveAnalysisService = objectiveAnalysisService;
        this.findingHierarchyService = findingHierarchyService;
        this.sourceOrchestrationService = sourceOrchestrationService;
        this.evidencePackageBuilder = evidencePackageBuilder;
    }

    private static final String SYSTEM_INSTRUCTION = """
            Sie sind ein Entscheidungsassistent für die deutsche Kommunalverwaltung.

            Ihre Aufgabe ist es, Sachbearbeiterinnen und Sachbearbeitern fundierte,
            evidenzbasierte Entscheidungsgrundlagen zu liefern.

            GRUNDREGELN:
            - Sie arbeiten AUSSCHLIESSLICH mit den bereitgestellten Beweisstücken.
            - Sie führen KEIN eigenes juristisches oder administratives Wissen ein.
            - Sie erfinden KEINE Vorschriften, Paragraphen, Beträge oder Verfahren.
            - Sie zitieren wörtlich aus den Beweisstücken.
            - Sie benennen Widersprüche, statt sie zu verschweigen.
            - Bei unzureichender Evidenz sagen Sie das klar und deutlich.
            - Sie schreiben in der Sprache einer deutschen Kommunalverwaltung.

            Sie sind KEIN Chatbot. Sie sind ein Verwaltungsassistent.
            """;

    @Override
    public PromptContext assemble(AiRequest request, RetrievalContext retrievalContext) {
        List<AnalysisObjective> objectives = objectiveAnalysisService.classify(request.question());
        FindingHierarchy hierarchy = findingHierarchyService.buildHierarchy(request.question(), objectives);
        SourceDossier dossier = sourceOrchestrationService.buildDossier(
                retrievalContext.sources(), request.question());

        // Build the evidence package from retrieval results
        EvidencePackage evidencePackage = evidencePackageBuilder.build(
                request.question(), retrievalContext.sources());

        return new PromptContext(
                SYSTEM_INSTRUCTION,
                request.question(),
                retrievalContext,
                request.context().messages(),
                objectives,
                hierarchy,
                dossier,
                request.retrievalScope(),
                evidencePackage);
    }
}
