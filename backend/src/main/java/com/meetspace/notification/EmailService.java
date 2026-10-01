package com.meetspace.notification;

import org.springframework.beans.factory.annotation.Value;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mail;
    private final String from;

    public EmailService(JavaMailSender mail, @Value("${MAIL_FROM:${spring.mail.username:}}") String from) {
        this.mail = mail;
        this.from = from;
    }

    public void send(EmailNotification notification) {
        if (from == null || from.isBlank()) {
            log.warn("Email delivery skipped because MAIL_FROM is not configured");
            return;
        }
        try {
            deliver(notification);
            log.info("Email notification delivered successfully to {}", notification.recipient());
        } catch (Exception e) {
            log.warn("Email delivery failed after commit for {}: {}", notification.recipient(), e.getMessage());
        }
    }

    private void deliver(EmailNotification notification) throws Exception {
        var message = mail.createMimeMessage();
        var helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(from);
        helper.setTo(notification.recipient());
        helper.setSubject(notification.subject());
        helper.setText(notification.body(), html(notification));
        mail.send(message);
    }

    public String html(EmailNotification notification) {
        try {
            return new ClassPathResource("templates/email/" + notification.type().template() + ".html")
                .getContentAsString(StandardCharsets.UTF_8)
                .replace("{{body}}", escape(notification.body()).replace("\n", "<br>"));
        } catch (Exception e) {
            return "<!doctype html><html><body><p>" + escape(notification.body()).replace("\n", "<br>") + "</p></body></html>";
        }
    }

    public String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
