package com.meetspace.cache;

import com.meetspace.dto.RoomDtos.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RoomIndexTest {

    private RoomIndex index;

    @BeforeEach
    void setUp() {
        index = new RoomIndex();
    }

    @Test
    void testPutAndGet() {
        UUID id = UUID.randomUUID();
        Room room = new Room(id, "R-101", "Boardroom", "1", 10, "Executive meeting space", List.of("Display", "VC"), true);

        assertFalse(index.contains(id));
        assertEquals(0, index.size());

        index.put(room);

        assertTrue(index.contains(id));
        assertEquals(1, index.size());
        assertTrue(index.get(id).isPresent());
        assertEquals("Boardroom", index.get(id).get().name());
    }

    @Test
    void testRemoveAndClear() {
        UUID id = UUID.randomUUID();
        Room room = new Room(id, "R-101", "Boardroom", "1", 10, "Executive meeting space", List.of("Display", "VC"), true);

        index.put(room);
        index.remove(id);

        assertFalse(index.contains(id));
        assertEquals(0, index.size());

        index.put(room);
        index.clear();
        assertEquals(0, index.size());
    }
}
