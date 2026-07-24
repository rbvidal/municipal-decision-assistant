package com.cognitera.platform.api.web;

import com.cognitera.platform.api.dto.dashboard.DashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for the home page dashboard.
 * Returns demo data for the dashboard home page.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardRestController {

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(new DashboardResponse(
            List.of(
                new DashboardResponse.DashboardStat("1", "Offene Vorgänge", "12", "info", null),
                new DashboardResponse.DashboardStat("2", "In Bearbeitung", "5", "info", null),
                new DashboardResponse.DashboardStat("3", "Überfällig", "3", "warning", null),
                new DashboardResponse.DashboardStat("4", "Diese Woche abgeschlossen", "8", "success", 67),
                new DashboardResponse.DashboardStat("5", "Genehmigungsquote", "94%", "success", null),
                new DashboardResponse.DashboardStat("6", "Ø Bearbeitungszeit", "4,2 Tage", "info", null)
            ),
            List.of(
                new DashboardResponse.DashboardCase("BAU-2026-0092", "Bauantrag Mehrfamilienhaus", "IN_REVIEW", "12.08.2026", "Bearbeiten"),
                new DashboardResponse.DashboardCase("ORD-2024-8812", "Ordnungswidrigkeit Lärmbelästigung", "DRAFTING", "Heute", "Bearbeiten"),
                new DashboardResponse.DashboardCase("GEW-2026-0147", "Gewerbeanmeldung Gastronomie", "NEW", "28.08.2026", "Bearbeiten"),
                new DashboardResponse.DashboardCase("BAU-2026-0104", "Nutzungsänderung Gewerbeeinheit", "DECISION_SUPPORT", "05.09.2026", "Bearbeiten"),
                new DashboardResponse.DashboardCase("SOZ-2026-0031", "Wohngeldantrag Erstantrag", "PENDING_APPROVAL", "18.08.2026", "Bearbeiten")
            ),
            new DashboardResponse.DashboardNextTask(
                "ORD-2024-8812",
                "Ordnungswidrigkeit Lärmbelästigung — Bescheid vorbereiten",
                "mittel",
                "19.07.2026"
            ),
            List.of(
                new DashboardResponse.DashboardSuggestion("s1", "BAU-2026-0092", "info", "Fristüberwachung",
                    "Die Stellungnahmefrist läuft in 3 Tagen ab.", "Frist verlängern"),
                new DashboardResponse.DashboardSuggestion("s2", "GEW-2026-0147", "warning", "Fehlende Unterlagen",
                    "Die Lärmgutachten fehlen noch.", "Unterlagen anfordern"),
                new DashboardResponse.DashboardSuggestion("s3", "SOZ-2026-0031", "success", "Entscheidungsvorlage",
                    "Eine Entscheidungsvorlage wurde automatisch erstellt.", "Vorlage prüfen")
            )
        ));
    }
}
