package com.meetspace.notification;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Test
    void skipsDeliveryWhenFromIsBlank() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService service = new EmailService(mailSender, "");

        var notification = new EmailNotification("recipient@example.com", "Verify your MeetSpace account", "Body");
        service.send(notification);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void deliversEmailWhenConfigured() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
        EmailService service = new EmailService(mailSender, "noreply@meetspace.com");

        var notification = new EmailNotification("recipient@example.com", "Verify your MeetSpace account", "Body");
        service.send(notification);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void escapesHtmlContentCorrectly() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService service = new EmailService(mailSender, "noreply@meetspace.com");

        String escaped = service.escape("A < B & C > D");
        assertEquals("A &lt; B &amp; C &gt; D", escaped);
    }

    @Test
    void generatesHtmlFromTemplate() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        EmailService service = new EmailService(mailSender, "noreply@meetspace.com");

        var notification = new EmailNotification(EmailNotification.Type.BOOKING_CONFIRMATION, "test@example.com", "Subject", "Line 1\nLine 2");
        String html = service.html(notification);

        assertNotNull(html);
        assertTrue(html.contains("MeetSpace"));
        assertTrue(html.contains("Line 1<br>Line 2"));
    }
}
