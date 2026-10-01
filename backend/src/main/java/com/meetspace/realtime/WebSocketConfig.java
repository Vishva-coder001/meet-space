package com.meetspace.realtime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Value("${meetspace.security.cors-allowed-origin}")
    String origin;

    public void configureMessageBroker(MessageBrokerRegistry r) {
        r.enableSimpleBroker("/topic", "/queue");
        r.setApplicationDestinationPrefixes("/app");
        r.setUserDestinationPrefix("/user");
    }

    public void registerStompEndpoints(StompEndpointRegistry r) {
        String[] origins = Arrays.stream(origin.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toArray(String[]::new);
        r.addEndpoint("/ws").setAllowedOrigins(origins);
    }
}