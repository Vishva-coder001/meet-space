package com.meetspace.cache;

import com.meetspace.dto.EmployeeDtos.Profile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EmployeeIndexTest {

    private EmployeeIndex index;

    @BeforeEach
    void setUp() {
        index = new EmployeeIndex();
    }

    @Test
    void testPutAndGet() {
        UUID id = UUID.randomUUID();
        Profile profile = new Profile(id, "EMP01", "Jane", "Doe", "Engineering", "+1234567890", "jane@example.com");

        assertFalse(index.contains(id));
        assertEquals(0, index.size());

        index.put(profile);

        assertTrue(index.contains(id));
        assertEquals(1, index.size());
        assertTrue(index.get(id).isPresent());
        assertEquals("Jane", index.get(id).get().firstName());
    }

    @Test
    void testRemoveAndClear() {
        UUID id = UUID.randomUUID();
        Profile profile = new Profile(id, "EMP01", "Jane", "Doe", "Engineering", "+1234567890", "jane@example.com");

        index.put(profile);
        index.remove(id);

        assertFalse(index.contains(id));
        assertEquals(0, index.size());

        index.put(profile);
        index.clear();
        assertEquals(0, index.size());
    }
}
