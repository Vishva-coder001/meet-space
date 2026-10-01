package com.meetspace.notification;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
public class EmailAfterCommitListener {
    private final EmailService service;

    public EmailAfterCommitListener(EmailService service) { this.service = service; }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void send(EmailNotification notification) { service.send(notification); }
}
