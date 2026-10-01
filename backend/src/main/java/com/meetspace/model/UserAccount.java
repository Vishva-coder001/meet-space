package com.meetspace.model;
import java.util.UUID;
public record UserAccount(UUID id, String email, String passwordHash, String role, boolean active, boolean emailVerified) {}