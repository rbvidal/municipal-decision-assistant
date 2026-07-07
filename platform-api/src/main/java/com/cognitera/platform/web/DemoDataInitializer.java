package com.cognitera.platform.web;

import com.cognitera.platform.document.infrastructure.persistence.DocumentEntity;
import com.cognitera.platform.document.infrastructure.persistence.DocumentVersionEntity;
import com.cognitera.platform.document.infrastructure.persistence.JpaDocumentEntityRepository;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.search.api.IndexingOrchestrationService;
import com.cognitera.platform.search.infrastructure.persistence.DocumentChunkEntity;
import com.cognitera.platform.search.infrastructure.persistence.JpaDocumentChunkRepository;
import com.cognitera.platform.search.model.ChunkType;
import com.cognitera.platform.workspace.infrastructure.persistence.JpaWorkspaceDocumentLinkRepository;
import com.cognitera.platform.workspace.infrastructure.persistence.JpaWorkspaceRepository;
import com.cognitera.platform.workspace.api.WorkspaceDocumentLinkEntity;
import com.cognitera.platform.workspace.api.WorkspaceEntity;
import com.cognitera.platform.workspace.model.WorkspacePhase;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import com.cognitera.platform.workspace.model.WorkspaceStatus;
import com.cognitera.platform.workspace.model.WorkspaceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.UUID;

/**
 * Creates the demo knowledge corpus on first startup.
 * Seeds 3 workspaces with 20 pre-indexed documents across all three SCCON demo domains.
 * Idempotent — skips if demo data already exists.
 */
@Component
public class DemoDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataInitializer.class);
    private static final String DEMO_TAG = "sccon-demo";
    private static final String ACTOR = "demo-setup";

    private final JpaDocumentEntityRepository documentRepo;
    private final JpaDocumentChunkRepository chunkRepo;
    private final JpaWorkspaceRepository workspaceRepo;
    private final JpaWorkspaceDocumentLinkRepository linkRepo;
    private final ObjectProvider<IndexingOrchestrationService> indexingOrchestrationProvider;

    public DemoDataInitializer(JpaDocumentEntityRepository documentRepo,
                               JpaDocumentChunkRepository chunkRepo,
                               JpaWorkspaceRepository workspaceRepo,
                               JpaWorkspaceDocumentLinkRepository linkRepo,
                               ObjectProvider<IndexingOrchestrationService> indexingOrchestrationProvider) {
        this.documentRepo = documentRepo;
        this.chunkRepo = chunkRepo;
        this.workspaceRepo = workspaceRepo;
        this.linkRepo = linkRepo;
        this.indexingOrchestrationProvider = indexingOrchestrationProvider;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (workspaceRepo.count() > 0) {
            log.info("Demo data exists — {} workspaces. Repairing missing files.", workspaceRepo.count());
            repairMissingFiles();
            repairMissingEmbeddings();
            return;
        }
        log.info("Seeding SCCON demo knowledge corpus...");
        Instant now = Instant.now();
        Map<String, WorkspaceEntity> workspaces = createWorkspaces(now);
        createBuildingDocuments(workspaces.get("building").getId(), now);
        createProcurementDocuments(workspaces.get("procurement").getId(), now);
        createHrDocuments(workspaces.get("hr").getId(), now);
        log.info("Demo corpus seeded: 3 workspaces, {} documents, {} chunks.",
                documentRepo.count(), chunkRepo.count());
        indexAllDocuments();
    }

    /** Rewrites demo document content to disk if the file is missing. */
    private void repairMissingFiles() {
        var docs = documentRepo.findAll();
        int repaired = 0;
        for (var doc : docs) {
            for (var ver : doc.getVersions()) {
                Path filePath = Path.of(ver.getStorageKey());
                if (!Files.exists(filePath)) {
                    try {
                        Files.createDirectories(filePath.getParent());
                        // Reconstruct content from chunks
                        var chunkList = chunkRepo.findByDocumentIdOrderByChunkIndex(doc.getId());
                        if (chunkList != null && !chunkList.isEmpty()) {
                            StringBuilder sb = new StringBuilder();
                            for (var c : chunkList) {
                                if (c.getText() != null) sb.append(c.getText()).append(" ");
                            }
                            Files.writeString(filePath, sb.toString().trim());
                            repaired++;
                        }
                    } catch (IOException e) {
                        log.warn("Could not repair file for {}: {}", doc.getTitle(), e.getMessage());
                    }
                }
            }
        }
        if (repaired > 0) log.info("Repaired {} missing demo files.", repaired);
    }

    /** Triggers embedding generation and Qdrant indexing for all demo documents that lack vectors. */
    private void repairMissingEmbeddings() {
        IndexingOrchestrationService indexing = indexingOrchestrationProvider.getIfAvailable();
        if (indexing == null) {
            log.warn("IndexingOrchestrationService not available — skipping embedding repair.");
            return;
        }
        var docs = documentRepo.findAll();
        int indexed = 0;
        int failed = 0;
        for (var doc : docs) {
            if (doc.getStatus() != DocumentStatus.READY) continue;
            try {
                indexing.reindexDocument(doc.getId());
                indexed++;
                log.info("Re-indexed document: {} ({} chunks)", doc.getTitle(),
                        chunkRepo.findByDocumentIdOrderByChunkIndex(doc.getId()).size());
            } catch (Exception e) {
                failed++;
                log.warn("Failed to re-index document {}: {}", doc.getTitle(), e.getMessage());
            }
        }
        log.info("Embedding repair complete: {} indexed, {} failed out of {} documents.",
                indexed, failed, docs.size());
    }

    /** Indexes all newly created demo documents into Qdrant. */
    private void indexAllDocuments() {
        IndexingOrchestrationService indexing = indexingOrchestrationProvider.getIfAvailable();
        if (indexing == null) {
            log.warn("IndexingOrchestrationService not available — embeddings not generated.");
            return;
        }
        var docs = documentRepo.findAll();
        int indexed = 0;
        for (var doc : docs) {
            if (doc.getStatus() != DocumentStatus.READY) continue;
            try {
                indexing.reindexDocument(doc.getId());
                indexed++;
            } catch (Exception e) {
                log.warn("Failed to index document {}: {}", doc.getTitle(), e.getMessage());
            }
        }
        log.info("Indexed {} documents into Qdrant.", indexed);
    }

    private Map<String, WorkspaceEntity> createWorkspaces(Instant now) {
        Map<String, WorkspaceEntity> map = new LinkedHashMap<>();

        WorkspaceEntity b = new WorkspaceEntity(null,
                "Building & Urban Planning",
                "Berlin building regulations, permits, zoning, and citizen information — BauO Bln, BauGB, BauNVO, BauVorlV 2025",
                WorkspaceType.RESEARCH.name(), ACTOR);
        b.setStatus(WorkspaceStatus.ACTIVE);
        b.setPhase(WorkspacePhase.COMPLETE);
        map.put("building", workspaceRepo.save(b));

        WorkspaceEntity p = new WorkspaceEntity(null,
                "Public Procurement",
                "German and Berlin procurement law — GWB, VgV, UVgO, VOB/A, BerlAVG, EU thresholds, sustainable procurement",
                WorkspaceType.RESEARCH.name(), ACTOR);
        p.setStatus(WorkspaceStatus.ACTIVE);
        p.setPhase(WorkspacePhase.COMPLETE);
        map.put("procurement", workspaceRepo.save(p));

        WorkspaceEntity h = new WorkspaceEntity(null,
                "Human Resources",
                "Berlin public service HR — TV-L 2025, travel expenses, vacation, home office, working time, IT security",
                WorkspaceType.RESEARCH.name(), ACTOR);
        h.setStatus(WorkspaceStatus.ACTIVE);
        h.setPhase(WorkspacePhase.COMPLETE);
        map.put("hr", workspaceRepo.save(h));

        return map;
    }

    // ─── Building Domain ───────────────────────────────────────

    private void createBuildingDocuments(String wsId, Instant now) {
        createDoc(wsId, now, "Bauordnung Berlin (BauO Bln)",
                DocumentType.TXT, "building-regulations",
                "The Berlin Building Code (BauO Bln) governs all construction activity in Berlin. "
                + "Section 6 defines setback requirements: buildings must maintain a minimum distance "
                + "of 0.4 times the building height from the property line, minimum 3 meters. "
                + "Section 62 allows permit exemption for residential buildings within a development plan. "
                + "Section 63 defines the simplified permit procedure for single-family homes and smaller commercial buildings. "
                + "Section 64 outlines the full building permit procedure required for large projects and special buildings. "
                + "Section 67 allows deviations, exceptions, and exemptions from building code requirements upon application. "
                + "Section 72a introduces Type Approvals for standardized buildings deployed across multiple locations. "
                + "The Schneller-Bauen-Gesetz (Dec 2024) reformed 45 norms across 10 laws, introducing mandatory "
                + "building application conferences for projects with 50+ residential units and a 4-week completeness check.");

        createDoc(wsId, now, "Baugesetzbuch (BauGB)",
                DocumentType.TXT, "building-regulations",
                "The Federal Building Code (BauGB) provides the legal framework for urban planning in Germany. "
                + "Section 1 mandates that municipalities prepare land-use plans to guide urban development. "
                + "Section 30 defines the admissibility of building projects within development plan areas. "
                + "Section 34 governs building within existing built-up areas (unplanned inner areas). "
                + "Section 35 addresses building in outer areas, generally restricting non-agricultural construction. "
                + "Development plans (Bebauungspläne) are legally binding and define permitted uses, building heights, "
                + "density, and design standards. The plan must be adopted by the district council and published.");

        createDoc(wsId, now, "Baunutzungsverordnung (BauNVO)",
                DocumentType.TXT, "building-regulations",
                "The Land Use Ordinance (BauNVO) defines 10 building zone categories. "
                + "Pure residential areas (WR) allow only residential use with a GRZ of 0.4 and GFZ of 1.2. "
                + "General residential areas (WA) permit some commercial uses, GRZ 0.4, GFZ 1.2. "
                + "Mixed areas (MI) allow residential and commercial in equal measure, GRZ 0.6, GFZ 1.2. "
                + "Commercial areas (GE) are for non-hazardous businesses, GRZ 0.8, GFZ 2.4. "
                + "Industrial areas (GI) permit all industrial uses, GRZ 0.8, GFZ 2.4. "
                + "Special areas (SO) are designated for specific uses like retail, hospitals, or recreation.");

        createDoc(wsId, now, "Bauvorlagenverordnung (BauVorlV) 2025",
                DocumentType.TXT, "building-regulations",
                "The Building Documents Ordinance 2025 replaces BauVerfV 2017, effective June 30, 2025. "
                + "Section 1 defines 11 procedure types requiring building documents. "
                + "Section 2 mandates electronic submission as PDF or PDF/A (ISO 19005-1), each document as a single file. "
                + "File naming convention: YYYYMMDD + description, no special characters. "
                + "Section 7 introduces the qualified open space plan for projects over 10 residential units. "
                + "Section 15 implements the new Type Approval procedure (Section 72a BauO Bln). "
                + "Type Approvals are valid for 5 years, renewable for 3-year periods. "
                + "Building application conferences are mandatory for projects of 50+ residential units.");

        createDoc(wsId, now, "Schneller-Bauen-Gesetz Berlin 2024",
                DocumentType.TXT, "building-regulations",
                "The Faster Building Act came into effect December 12, 2024, reforming 45 norms across 10 state laws. "
                + "Building application conferences (Section 58 BauO Bln) are now mandatory for residential projects "
                + "of 50+ units, schools, daycare centers, and commercial projects over 3,000 square meters floor area. "
                + "The completeness check must be completed within 4 weeks. "
                + "After completeness is confirmed, a decision must be issued within 1 month (approval fiction applies). "
                + "Simplified procedure for attic conversions and rooftop additions with relaxed fire safety and structural requirements.");

        createDoc(wsId, now, "Berlin Building Permit Procedure",
                DocumentType.HTML, "procedures",
                "Building Permit Procedure in Berlin. Step 1: Determine the applicable procedure type. "
                + "Step 2: Engage a building document author (architect or civil engineer). "
                + "Step 3: Prepare all required building documents including location plan, construction drawings, "
                + "building description, structural analysis, and fire safety certificate. "
                + "Step 4: Submit application electronically to the responsible district building authority. "
                + "Step 5: Authority checks completeness within 4 weeks. "
                + "Step 6: Neighbour participation per Section 70 BauO Bln. "
                + "Step 7: Involvement of relevant authorities such as fire department, monument protection, and environmental agency. "
                + "Step 8: Decision within 1 month after completeness confirmation. "
                + "Step 9: Building permit is issued or denied in writing.");

        createDoc(wsId, now, "Building Application Form — Land Berlin",
                DocumentType.HTML, "forms",
                "Building Application Form for Land Berlin. Required information: "
                + "Property details including district, parcel, and land registry sheet. "
                + "Building owner: name, address, and contact information. "
                + "Building document author: name and chamber membership number. "
                + "Project description: type of building, number of units, floor area, building height. "
                + "Use type: residential, commercial, mixed, or special. "
                + "Parking: number of car parking spaces and bicycle stands required. "
                + "Signature of building owner and building document author required.");

        createDoc(wsId, now, "Abstandsflächen in Berlin — Merkblatt",
                DocumentType.TXT, "citizen-information",
                "Setback requirements in Berlin per Section 6 BauO Bln: The minimum setback distance "
                + "is 0.4 times the building height (H), with a minimum of 3 meters. "
                + "In closed construction (geschlossene Bauweise), buildings may be built directly on the property line. "
                + "Certain small structures such as garages, sheds, and greenhouses are exempt from setback requirements "
                + "if they meet specific maximum dimensions: no more than 9 meters length and no more than 3.20 meters height per Section 6(7).");
    }

    // ─── Procurement Domain ────────────────────────────────────

    private void createProcurementDocuments(String wsId, Instant now) {
        createDoc(wsId, now, "GWB Teil 4 — Vergaberecht",
                DocumentType.TXT, "procurement-regulations",
                "Part 4 of the Act Against Restraints of Competition (GWB) governs public procurement above EU thresholds. "
                + "Section 97 sets fundamental principles: competition, transparency, equal treatment, non-discrimination, "
                + "and promotion of small and medium enterprises. Contracts shall be divided into trade and quantity lots. "
                + "Section 101 defines available procedures: open, restricted, negotiated, competitive dialogue, innovation partnership. "
                + "EU thresholds for 2024: construction 5,538,000 euros; supplies and services for federal authorities 143,000 euros; "
                + "other contracting authorities 221,000 euros; utilities sector 443,000 euros; concessions 5,538,000 euros. "
                + "Section 160 requires bidders to file complaints within 10 calendar days of discovering a violation. "
                + "The 2024 reform introduced a permanent 50,000 euro direct award threshold on the federal level.");

        createDoc(wsId, now, "Vergabeverordnung (VgV)",
                DocumentType.TXT, "procurement-regulations",
                "The Procurement Ordinance (VgV) implements EU Directive 2014/24/EU into German law. "
                + "Section 14 VgV requires contracting authorities to publish contract notices in the EU Official Journal. "
                + "Standard minimum periods: open procedure 35 days from notice publication; restricted procedure 30 days "
                + "for participation requests plus 30 days for bids. "
                + "Selection criteria must be related and proportionate to the subject matter of the contract. "
                + "Award criteria must be linked to the subject matter and may include quality, environmental, social, "
                + "and innovative aspects alongside price. The economically most advantageous tender wins.");

        createDoc(wsId, now, "Unterschwellenvergabeordnung (UVgO)",
                DocumentType.TXT, "procurement-regulations",
                "The Sub-Threshold Procurement Ordinance (UVgO) applies to supply and service contracts below EU thresholds. "
                + "Section 14 UVgO allows direct awards up to specified value limits. "
                + "For Berlin per AV zu Paragraph 55 LHO: direct awards up to 10,000 euros for supplies and services; "
                + "restricted tenders up to 100,000 euros for supplies and services and up to 200,000 euros for building construction "
                + "or 500,000 euros for other construction works. "
                + "A negotiated award (Verhandlungsvergabe) is permissible for low-value contracts when no suitable bids "
                + "are expected from a formal procedure. All awards above 25,000 euros must be published ex-post on the "
                + "Berlin procurement platform at vergabe-plattform.berlin.de.");

        createDoc(wsId, now, "AV zu Paragraph 55 LHO Berlin — Wertgrenzen",
                DocumentType.TXT, "procurement-regulations",
                "Berlin Administrative Regulation to Section 55 of the State Budget Code defines value thresholds. "
                + "Direct award (Direktauftrag): up to 10,000 euros for supplies and services; up to 20,000 euros for building construction; "
                + "up to 50,000 euros for other construction works. "
                + "Restricted tender without competition (Beschraenkte Ausschreibung): up to 100,000 euros for supplies and services; "
                + "up to 200,000 euros for building construction; up to 500,000 euros for other construction. "
                + "Above these thresholds: public tender or EU-wide procedure applies. "
                + "Three comparison offers are required for direct awards above 500 euros. "
                + "Ex-ante publication is required for restricted tenders from 25,000 euros. "
                + "Ex-post publication for restricted tenders without competition from 25,000 euros "
                + "and negotiated awards from 15,000 euros (VOB/A) or 25,000 euros (UVgO).");

        createDoc(wsId, now, "Berliner Ausschreibungs- und Vergabegesetz (BerlAVG)",
                DocumentType.TXT, "procurement-regulations",
                "The Berlin Tender and Procurement Act (BerlAVG) applies to all Berlin public contracts. "
                + "Section 3 establishes a mandatory minimum wage for public contracts currently at 13.69 euros per hour. "
                + "Section 7 requires environmental criteria to be considered in procurement decisions. "
                + "Section 8 mandates social criteria including compliance with ILO core labor standards. "
                + "Section 9 requires contractors to comply with women's advancement policies. "
                + "The law applies to both above-threshold and below-threshold procurement.");

        createDoc(wsId, now, "eVergabe Plattform Berlin — Leitfaden",
                DocumentType.HTML, "manuals",
                "Berlin eProcurement Platform Guide. The official Berlin procurement platform is at "
                + "vergabe-plattform.berlin.de. Companies register to create a bidder profile and receive "
                + "automatic notifications for relevant tenders. "
                + "Step 1: Register on the platform with company details. "
                + "Step 2: Configure search profiles for relevant product categories. "
                + "Step 3: Download tender documents for interesting opportunities. "
                + "Step 4: Submit bids electronically before the deadline. "
                + "Step 5: Track bid status through the platform. "
                + "All ex-ante and ex-post publications for Berlin contracts are made through this platform.");
    }

    // ─── HR Domain ─────────────────────────────────────────────

    private void createHrDocuments(String wsId, Instant now) {
        createDoc(wsId, now, "TV-L 2025 — Tarifvertrag fuer den oeffentlichen Dienst der Laender",
                DocumentType.TXT, "hr-regulations",
                "The Collective Agreement for the Public Service of the Laender (TV-L) governs employment conditions "
                + "for all tariff employees in Berlin's administration. Regular working time: 39 hours 50 minutes per week. "
                + "Annual leave: 30 working days for a 5-day week. Leave carry-over deadline: March 31 of the following year. "
                + "Probationary period: 6 months. Notice periods: 1 month under 1 year of service, "
                + "6 weeks to quarter end for 1 to 5 years, 3 months to quarter end for 5 to 8 years, "
                + "4 months for 8 to 10 years, 5 months for 10 to 12 years, 6 months for over 12 years. "
                + "Unlimited employment protection after 15 years of service and age 40. "
                + "The 2024/2025 pay agreement: 200 euros flat increase from November 2024, "
                + "plus 5.5 percent (minimum 340 euros) from February 2025. "
                + "Inflation compensation: 3,000 euros total (1,800 euros lump sum December 2023 plus 120 euros per month January to October 2024).");

        createDoc(wsId, now, "TV-L Entgelttabellen 2025",
                DocumentType.TXT, "hr-regulations",
                "TV-L Pay Tables effective February 1, 2025. EG 1 Stufe 1: 2,711.20 euros. EG 5 Stufe 2: 3,362.72 euros. "
                + "EG 8 Stufe 3: 3,713.37 euros. EG 9a Stufe 2: 3,715.69 euros. EG 9b Stufe 3: 4,117.53 euros. "
                + "EG 10 Stufe 2: 4,231.36 euros. EG 11 Stufe 3: 4,875.49 euros. EG 12 Stufe 3: 5,390.41 euros. "
                + "EG 13 Stufe 3: 5,467.76 euros. EG 14 Stufe 3: 6,013.61 euros. EG 15 Stufe 3: 6,439.92 euros. "
                + "Step advancement: stage 1 to 2 after 1 year, 2 to 3 after 3 years, 3 to 4 after 4 years, 4 to 5 after 5 years, 5 to 6 after 6 years. "
                + "Annual special payment (Jahressonderzahlung): 84.51 percent of September salary for EG 1 to 8, "
                + "70.28 percent for EG 9a to 12, 51.06 percent for EG 13 to 15.");

        createDoc(wsId, now, "Bundesreisekostengesetz (BRKG)",
                DocumentType.TXT, "hr-regulations",
                "The Federal Travel Expense Act (BRKG) governs reimbursement for official travel. "
                + "Daily subsistence allowance within Germany: 6 euros for absences over 8 hours, 12 euros for over 11 hours, "
                + "24 euros for a full 24-hour day. Arrival and departure day with overnight stay: 12 euros. "
                + "International rates vary by country. For example, Brussels: 47 euros per day. "
                + "Mileage reimbursement for private car: 0.35 euros per kilometer. Lodging: up to 80 euros per night with receipt, "
                + "20 euros flat rate without receipt. Breakfast deduction: 2.17 euros in 2024, lunch or dinner: 4.13 euros each. "
                + "Claim deadline: 6 months after travel completion. "
                + "Public transport: 2nd class rail, economy class flights only with justification. "
                + "After 3 months at the same external duty station, tax-free per diem eligibility expires.");

        createDoc(wsId, now, "Urlaubsverordnung Berlin (UrlVO Bln)",
                DocumentType.TXT, "hr-regulations",
                "The Berlin Leave Regulation governs vacation for Berlin public service employees. "
                + "Annual leave entitlement: 30 working days for a 5-day work week. "
                + "Leave must be taken in the calendar year. Carry-over to the next year is possible "
                + "until March 31 if justified by urgent operational reasons or personal circumstances. "
                + "Leave beyond March 31 requires special justification such as extended illness. "
                + "Partial leave: minimum half-day increments. Special leave (Sonderurlaub) of up to 4 days "
                + "with full pay is available for acute care needs of close relatives. "
                + "Applications must be submitted to the direct supervisor at least 2 weeks in advance for planned leave.");

        createDoc(wsId, now, "Mobile Arbeit — Rahmenvereinbarung Berlin",
                DocumentType.TXT, "hr-regulations",
                "The Berlin Mobile Work Framework Agreement allows employees to work remotely. "
                + "Up to 3 days per week of mobile work are permitted where the role allows it. "
                + "A written application is required, specifying the desired work schedule and location. "
                + "The employer provides basic IT equipment including laptop and headset. Additional equipment "
                + "such as monitor, keyboard, and desk is the employee's responsibility. "
                + "Occupational health and safety regulations apply to the home office workplace. "
                + "Data protection requirements must be met with no access by third parties to work devices. "
                + "The agreement can be revoked by either party with 4 weeks notice for operational reasons.");

        createDoc(wsId, now, "IT-Sicherheitsleitlinie Berlin",
                DocumentType.TXT, "hr-regulations",
                "Berlin IT Security Policy establishes binding security requirements for all administration employees. "
                + "Passwords must be changed every 90 days and be at least 12 characters with mixed character types. "
                + "Private software installation is prohibited. Suspicious emails must be reported to the IT security officer "
                + "within 2 hours. In case of a security incident: disconnect from the network immediately, "
                + "contact the ITDZ hotline, change all passwords, and document the incident. "
                + "No private USB devices may be connected to work computers. "
                + "Mobile work requires VPN connection and encrypted devices. "
                + "All security incidents must be documented in the incident reporting system.");

        createDoc(wsId, now, "Arbeitszeitverordnung Berlin (AZVO Bln)",
                DocumentType.TXT, "hr-regulations",
                "The Berlin Working Time Regulation implements the Federal Working Time Act (ArbZG). "
                + "Regular weekly working time: 40 hours for civil servants, 39 hours 50 minutes for tariff employees. "
                + "Flexitime: core hours are typically 9:30 to 15:00. Outside core hours, employees may choose "
                + "their start and end times. Maximum daily working time: 10 hours. "
                + "Rest period between work days: minimum 11 hours. "
                + "Overtime must be approved in advance by the supervisor. Time credits can be carried forward "
                + "to the following month up to a maximum of 40 hours. "
                + "Part-time requests must be submitted 4 months before the desired start date for family reasons.");

        createDoc(wsId, now, "Beschaffungsordnung Berlin — Intern",
                DocumentType.TXT, "internal-procedures",
                "Internal Berlin Procurement Order regulates purchasing within the administration. "
                + "Individual purchases up to 500 euros may be made without prior approval from the supervisor. "
                + "Purchases from 500 to 1,000 euros require written supervisor approval before ordering. "
                + "Purchases over 1,000 euros require a formal procurement memorandum (Vergabevermerk) documenting "
                + "the procurement decision, market research, and selection criteria. "
                + "Three comparison offers are required for purchases over 500 euros for direct awards. "
                + "The procurement memorandum must include justification for the chosen procedure and documentation "
                + "of the offer evaluation. Budget responsibility lies with the respective cost center manager.");

        createDoc(wsId, now, "Landesreisekostengesetz Berlin (LRKG)",
                DocumentType.TXT, "hr-regulations",
                "The Berlin State Travel Expense Act (LRKG) applies to Berlin state employees on official travel. "
                + "It largely mirrors the Federal BRKG but applies specifically to Land Berlin employees. "
                + "Key differences from BRKG: Berlin-specific rates for certain allowances and procedural requirements. "
                + "Travel expense claims must be submitted within 6 months of trip completion. "
                + "The standard daily rates mirror BRKG: 6 euros for over 8 hours, 12 euros for over 11 hours, 24 euros for 24 hours. "
                + "For international travel, the BRKG international rates apply by reference.");
    }

    // ─── Document Creation Helper ──────────────────────────────

    private void createDoc(String workspaceId, Instant now, String title,
                           DocumentType type, String category, String content) {
        // Write file to disk so extraction works
        String filePath;
        try {
            Path uploadDir = Path.of("uploads", "demo-data");
            Files.createDirectories(uploadDir);
            Path file = uploadDir.resolve(UUID.randomUUID() + "_" + sanitizeFileName(title) + ".txt");
            Files.writeString(file, content);
            filePath = file.toString();
        } catch (IOException e) {
            log.warn("Could not write demo file for {}: {}", title, e.getMessage());
            filePath = "demo-data/" + title + ".txt";
        }

        // Create document entity
        DocumentEntity doc = new DocumentEntity(
                null, title, type, category,
                Set.of(DEMO_TAG, category), "INTERNAL", ACTOR);
        doc.markStatus(DocumentStatus.READY, ACTOR);

        // Create version pointing to real file
        DocumentVersionEntity version = new DocumentVersionEntity(
                1, title + ".txt", "text/plain",
                (long) content.length(), "local-fs",
                filePath,
                UUID.randomUUID().toString(), ACTOR);
        doc.addVersion(version, ACTOR);

        documentRepo.save(doc);

        // Create chunks for keyword search
        String[] paragraphs = content.split("(?<=\\.) ");
        int chunkIdx = 0;
        int offset = 0;
        for (String para : paragraphs) {
            String trimmed = para.trim();
            if (trimmed.isEmpty()) continue;
            int endOffset = offset + trimmed.length();
            DocumentChunkEntity chunk = new DocumentChunkEntity(
                    UUID.randomUUID(), doc.getId(), 1,
                    ChunkType.TEXT, trimmed,
                    null, null, chunkIdx, offset,
                    endOffset, title, type, category,
                    Set.of(DEMO_TAG, category),
                    filePath, null, now,
                    Set.of(), null);
            chunkRepo.save(chunk);
            chunkIdx++;
            offset = endOffset + 1;
        }
        log.info("  Created doc: {} ({} chunks)", title, chunkIdx);

        // Link to workspace
        String docId = doc.getId().toString();
        var link = new WorkspaceDocumentLinkEntity(
                null, workspaceId, docId, title,
                com.cognitera.platform.workspace.model.DocumentType.POLICY_DOCUMENT, category);
        linkRepo.save(link);
    }

    private static String sanitizeFileName(String title) {
        return title.replaceAll("[^a-zA-Z0-9\\-_. ]", "").replace(' ', '_');
    }
}
