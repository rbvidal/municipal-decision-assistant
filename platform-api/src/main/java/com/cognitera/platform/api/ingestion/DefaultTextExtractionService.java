package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.api.TextExtractionService;
import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.document.model.DocumentVersion;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Default implementation of {@link TextExtractionService} with fallback chains
 * for PDF (PDFBox → Tika) and DOCX (POI → Tika). On total failure, returns
 * partial or empty text rather than throwing.
 */
@Component
public class DefaultTextExtractionService implements TextExtractionService {

    private static final Logger log = LoggerFactory.getLogger(DefaultTextExtractionService.class);

    private final Tika tika;

    public DefaultTextExtractionService(MeterRegistry meterRegistry) {
        this.tika = new Tika();
        this.pdfboxFallbackCounter = Counter.builder("ingestion.extraction.fallback")
                .tag("primary", "pdfbox")
                .tag("fallback", "tika")
                .description("PDFBox extraction failures that fell back to Tika")
                .register(meterRegistry);
        this.poiFallbackCounter = Counter.builder("ingestion.extraction.fallback")
                .tag("primary", "poi")
                .tag("fallback", "tika")
                .description("POI extraction failures that fell back to Tika")
                .register(meterRegistry);
        this.totalFailureCounter = Counter.builder("ingestion.extraction.failure")
                .description("Extraction failures where all fallbacks were exhausted")
                .register(meterRegistry);
    }

    private final Counter pdfboxFallbackCounter;
    private final Counter poiFallbackCounter;
    private final Counter totalFailureCounter;

    @Override
    public String extractText(DocumentType type, DocumentVersion version) {
        if (!"local-fs".equalsIgnoreCase(version.storageProvider())) {
            throw new IllegalStateException("Unsupported storage provider: " + version.storageProvider());
        }
        Path path = Path.of(version.storageKey());
        if (!Files.exists(path)) {
            throw new IllegalStateException("Stored file not found: " + version.storageKey());
        }
        try (InputStream in = Files.newInputStream(path)) {
            return switch (type) {
                case TXT -> extractTxt(in);
                case HTML -> extractHtml(in);
                case DOCX -> extractDocx(in);
                case PDF -> extractPdf(in);
                default -> throw new IllegalStateException("Unsupported document type for file-based extraction: " + type);
            };
        } catch (Exception ex) {
            log.warn("All extraction strategies exhausted for {} document: {}", type, ex.getMessage());
            totalFailureCounter.increment();
            return "";
        }
    }

    // ── Primary extractors ──

    private String extractTxt(InputStream in) throws IOException {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    private String extractHtml(InputStream in) throws IOException {
        return Jsoup.parse(new String(in.readAllBytes(), StandardCharsets.UTF_8)).text();
    }

    // ── PDF: PDFBox → Tika fallback ──

    private String extractPdf(InputStream in) {
        try {
            return extractPdfWithBox(in);
        } catch (Exception pdfBoxError) {
            log.warn("PDFBox extraction failed, falling back to Tika: {}", pdfBoxError.getMessage());
            pdfboxFallbackCounter.increment();
            try {
                return extractWithTika(in);
            } catch (Exception tikaError) {
                log.warn("Tika PDF fallback also failed: {}", tikaError.getMessage());
                throw new RuntimeException("PDF extraction failed with both PDFBox and Tika", tikaError);
            }
        }
    }

    private String extractPdfWithBox(InputStream in) throws IOException {
        byte[] bytes = in.readAllBytes();
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    // ── DOCX: POI → Tika fallback ──

    private String extractDocx(InputStream in) {
        try {
            // POI needs the raw bytes for the XWPFDocument constructor
            return DocxTextExtractor.extract(in);
        } catch (Exception poiError) {
            log.warn("POI extraction failed, falling back to Tika: {}", poiError.getMessage());
            poiFallbackCounter.increment();
            try {
                return extractWithTika(in);
            } catch (Exception tikaError) {
                log.warn("Tika DOCX fallback also failed: {}", tikaError.getMessage());
                throw new RuntimeException("DOCX extraction failed with both POI and Tika", tikaError);
            }
        }
    }

    // ── Tika universal fallback ──

    private String extractWithTika(InputStream in) throws IOException, TikaException {
        return tika.parseToString(in);
    }
}
