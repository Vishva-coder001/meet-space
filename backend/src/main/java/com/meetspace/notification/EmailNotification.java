package com.meetspace.notification;

/** A delivery request published inside a transaction and handled only after commit. */
public record EmailNotification(Type type, String recipient, String subject, String body) {
    public EmailNotification(String recipient, String subject, String body) {
        this(subject.contains("Verify") ? Type.VERIFICATION : subject.contains("Reset") ? Type.PASSWORD_RESET : subject.contains("confirmed") ? Type.BOOKING_CONFIRMATION : Type.BOOKING_CANCELLATION, recipient, subject, body);
    }
    public enum Type {
        VERIFICATION("verification"),
        PASSWORD_RESET("password-reset"),
        BOOKING_CONFIRMATION("booking-confirmation"),
        BOOKING_CANCELLATION("booking-cancellation");

        private final String template;
        Type(String template) { this.template = template; }
        public String template() { return template; }
    }
}
