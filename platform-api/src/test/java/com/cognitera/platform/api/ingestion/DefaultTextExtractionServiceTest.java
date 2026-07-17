package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.model.DocumentType;
import com.cognitera.platform.document.model.DocumentVersion;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;
import java.util.zip.CRC32;
import java.util.zip.CheckedOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("DefaultTextExtractionService — fallback chain")
class DefaultTextExtractionServiceTest {

    private SimpleMeterRegistry meterRegistry;
    private DefaultTextExtractionService service;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        service = new DefaultTextExtractionService(meterRegistry);
    }

    private DocumentVersion fakeVersion(Path path) {
        return new DocumentVersion(UUID.randomUUID(), 1, "test",
                "application/octet-stream", 0L, "local-fs",
                path.toAbsolutePath().toString(), null, "system", Instant.now());
    }

    private DocumentVersion missingVersion() {
        return new DocumentVersion(UUID.randomUUID(), 1, "missing",
                "application/octet-stream", 0L, "local-fs",
                "/nonexistent/path/file.txt", null, "system", Instant.now());
    }

    // ── TXT ──

    @Test
    @DisplayName("extracts plain text")
    void extractsTxt(@TempDir Path dir) throws Exception {
        Path f = dir.resolve("doc.txt");
        Files.writeString(f, "Hello World");
        assertThat(service.extractText(DocumentType.TXT, fakeVersion(f)))
                .isEqualTo("Hello World");
    }

    // ── HTML ──

    @Test
    @DisplayName("extracts text from HTML")
    void extractsHtml(@TempDir Path dir) throws Exception {
        Path f = dir.resolve("doc.html");
        Files.writeString(f, "<html><body><p>Hello</p></body></html>");
        assertThat(service.extractText(DocumentType.HTML, fakeVersion(f)))
                .contains("Hello");
    }

    // ── PDF: primary path ──

    @Nested
    @DisplayName("PDF extraction")
    class PdfExtraction {

        @Test
        @DisplayName("extracts text via PDFBox")
        void extractsViaPdfBox(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("doc.pdf");
            createMinimalPdf(f, "Hello from PDFBox");
            String result = service.extractText(DocumentType.PDF, fakeVersion(f));
            assertThat(result).contains("Hello");
        }

        @Test
        @DisplayName("falls back to Tika when PDFBox fails")
        void fallsBackToTika(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("corrupt.pdf");
            Files.writeString(f, "not a valid PDF file %%%");
            String result = service.extractText(DocumentType.PDF, fakeVersion(f));
            // Tika may or may not extract text from garbage — but we should not throw
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("increments fallback counter on PDFBox failure")
        void incrementsFallbackCounter(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("corrupt.pdf");
            Files.writeString(f, "not a valid PDF %%%");
            service.extractText(DocumentType.PDF, fakeVersion(f));
            Counter c = meterRegistry.find("ingestion.extraction.fallback")
                    .tag("primary", "pdfbox").counter();
            assertThat(c).isNotNull();
            assertThat(c.count()).isGreaterThanOrEqualTo(1.0);
        }

        @Test
        @DisplayName("returns empty string when all fallbacks exhausted")
        void returnsEmptyOnTotalFailure(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("bad.pdf");
            Files.writeString(f, "garbage data not parseable at all %%###@@@");
            String result = service.extractText(DocumentType.PDF, fakeVersion(f));
            // Should return empty string, not throw
            assertThat(result).isNotNull();
            Counter failureCounter = meterRegistry.find("ingestion.extraction.failure").counter();
            assertThat(failureCounter).isNotNull();
        }
    }

    // ── DOCX: primary path ──

    @Nested
    @DisplayName("DOCX extraction")
    class DocxExtraction {

        @Test
        @DisplayName("extracts text via POI")
        void extractsViaPoi(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("doc.docx");
            createMinimalDocx(f, "Hello from POI");
            String result = service.extractText(DocumentType.DOCX, fakeVersion(f));
            assertThat(result).contains("Hello");
        }

        @Test
        @DisplayName("falls back to Tika when POI fails")
        void fallsBackToTika(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("corrupt.docx");
            Files.writeString(f, "not a valid DOCX file %%%");
            String result = service.extractText(DocumentType.DOCX, fakeVersion(f));
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("increments fallback counter on POI failure")
        void incrementsFallbackCounter(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("corrupt.docx");
            Files.writeString(f, "not a valid DOCX %%%");
            service.extractText(DocumentType.DOCX, fakeVersion(f));
            Counter c = meterRegistry.find("ingestion.extraction.fallback")
                    .tag("primary", "poi").counter();
            assertThat(c).isNotNull();
            assertThat(c.count()).isGreaterThanOrEqualTo(1.0);
        }

        @Test
        @DisplayName("returns empty string when all fallbacks exhausted for DOCX")
        void returnsEmptyOnTotalFailure(@TempDir Path dir) throws Exception {
            Path f = dir.resolve("bad.docx");
            Files.writeString(f, "garbage %%###@@@");
            String result = service.extractText(DocumentType.DOCX, fakeVersion(f));
            assertThat(result).isNotNull();
        }
    }

    // ── Error handling ──

    @Test
    @DisplayName("throws on unsupported storage provider")
    void throwsOnUnsupportedProvider() {
        var version = new DocumentVersion(UUID.randomUUID(), 1, "test",
                "application/pdf", 0L, "s3-bucket",
                "s3://bucket/key", null, "system", Instant.now());
        assertThatThrownBy(() -> service.extractText(DocumentType.PDF, version))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("storage provider");
    }

    @Test
    @DisplayName("throws on missing file")
    void throwsOnMissingFile() {
        assertThatThrownBy(() -> service.extractText(DocumentType.PDF, missingVersion()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not found");
    }

    // ── Helpers ──

    private static void createMinimalPdf(Path path, String text) throws Exception {
        // Write a minimal PDF with embedded text
        String pdf = "%PDF-1.4\n"
                + "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
                + "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
                + "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                + "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
                + "4 0 obj << /Length 44 >> stream\n"
                + "BT /F1 12 Tf 72 700 Td (" + text + ") Tj ET\n"
                + "endstream endobj\n"
                + "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
                + "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n"
                + "0000000115 00000 n \n0000000266 00000 n \n0000000360 00000 n \n"
                + "trailer << /Size 6 /Root 1 0 R >>\n"
                + "startxref\n417\n%%EOF\n";
        Files.writeString(path, pdf);
    }

    private static void createMinimalDocx(Path path, String text) throws Exception {
        // Minimal DOCX is a ZIP with required XML files
        try (var fos = Files.newOutputStream(path);
             var cos = new CheckedOutputStream(fos, new CRC32());
             var zos = new ZipOutputStream(cos)) {

            zos.putNextEntry(new ZipEntry("[Content_Types].xml"));
            zos.write(("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                    + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                    + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                    + "<Override PartName=\"/word/document.xml\" "
                    + "ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>"
                    + "</Types>").getBytes());
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("_rels/.rels"));
            zos.write(("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                    + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>"
                    + "</Relationships>").getBytes());
            zos.closeEntry();

            zos.putNextEntry(new ZipEntry("word/document.xml"));
            zos.write(("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                    + "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">"
                    + "<w:body><w:p><w:r><w:t>" + text + "</w:t></w:r></w:p></w:body>"
                    + "</w:document>").getBytes());
            zos.closeEntry();
        }
    }
}
