package com.meetspace.notification;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailNotificationTest {

    @Test
    void detectsVerificationTypeFromSubject() {
        var notification = new EmailNotification("user@example.com", "Verify your MeetSpace account", "Body content");
        assertEquals(EmailNotification.Type.VERIFICATION, notification.type());
        assertEquals("verification", notification.type().template());
        assertEquals("user@example.com", notification.recipient());
    }

    @Test
    void detectsPasswordResetTypeFromSubject() {
        var notification = new EmailNotification("user@example.com", "Reset your MeetSpace password", "Body content");
        assertEquals(EmailNotification.Type.PASSWORD_RESET, notification.type());
        assertEquals("password-reset", notification.type().template());
    }

    @Test
    void detectsBookingConfirmationTypeFromSubject() {
        var notification = new EmailNotification("user@example.com", "MeetSpace booking confirmed", "Booking details");
        assertEquals(EmailNotification.Type.BOOKING_CONFIRMATION, notification.type());
        assertEquals("booking-confirmation", notification.type().template());
    }

    @Test
    void detectsBookingCancellationTypeFromSubject() {
        var notification = new EmailNotification("user@example.com", "MeetSpace booking cancelled", "Cancelled details");
        assertEquals(EmailNotification.Type.BOOKING_CANCELLATION, notification.type());
        assertEquals("booking-cancellation", notification.type().template());
    }

    @Test
    void explicitTypeConstructorWorks() {
        var notification = new EmailNotification(EmailNotification.Type.BOOKING_CONFIRMATION, "user@example.com", "Custom Subject", "Custom Body");
        assertEquals(EmailNotification.Type.BOOKING_CONFIRMATION, notification.type());
        assertEquals("Custom Subject", notification.subject());
        assertEquals("Custom Body", notification.body());
    }
}
