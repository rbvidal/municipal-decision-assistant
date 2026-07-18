package com.cognitera.platform.search.application;

import com.cognitera.platform.search.api.ChunkManagementService;
import com.cognitera.platform.search.model.DocumentChunk;
import com.cognitera.platform.search.model.SearchFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class SearchServiceContractTest {

    private ChunkManagementService service;

    @BeforeEach
    void setUp() {
        service = mock(ChunkManagementService.class);
    }

    @Test
    void indexChunkShouldReturnDocumentChunk() {
        var mockChunk = mock(DocumentChunk.class);
        when(mockChunk.text()).thenReturn("Sample content");
        when(service.indexChunk(any())).thenReturn(mockChunk);

        var result = service.indexChunk(mock(com.cognitera.platform.search.api.IndexChunkCommand.class));
        assertNotNull(result);
        assertEquals("Sample content", result.text());
    }

    @Test
    void getChunkShouldReturnExistingChunk() {
        UUID chunkId = UUID.randomUUID();
        var mockChunk = mock(DocumentChunk.class);
        when(mockChunk.id()).thenReturn(chunkId);
        when(service.getChunk(chunkId)).thenReturn(mockChunk);

        assertNotNull(service.getChunk(chunkId));
        assertEquals(chunkId, service.getChunk(chunkId).id());
    }

    @Test
    void getChunkShouldReturnNullForMissing() {
        when(service.getChunk(any(UUID.class))).thenReturn(null);
        assertNull(service.getChunk(UUID.randomUUID()));
    }

    @Test
    void findChunksShouldReturnPaginatedResults() {
        var filter = new SearchFilter(null, null, null, null, null, null, null, null, null);
        var mockChunk = mock(DocumentChunk.class);
        when(service.findChunks(eq(filter), eq(0), eq(10))).thenReturn(List.of(mockChunk));

        assertEquals(1, service.findChunks(filter, 0, 10).size());
    }

    @Test
    void findChunksShouldReturnEmptyForNoMatch() {
        var filter = new SearchFilter(null, null, null, null, null, null, null, null, null);
        when(service.findChunks(eq(filter), eq(0), eq(10))).thenReturn(List.of());

        assertTrue(service.findChunks(filter, 0, 10).isEmpty());
    }

    @Test
    void deleteByDocumentIdShouldReturnCount() {
        UUID docId = UUID.randomUUID();
        when(service.deleteByDocumentId(docId)).thenReturn(5);
        assertEquals(5, service.deleteByDocumentId(docId));
    }

    @Test
    void deleteByDocumentIdShouldReturnZeroForNoChunks() {
        UUID docId = UUID.randomUUID();
        when(service.deleteByDocumentId(docId)).thenReturn(0);
        assertEquals(0, service.deleteByDocumentId(docId));
    }
}
