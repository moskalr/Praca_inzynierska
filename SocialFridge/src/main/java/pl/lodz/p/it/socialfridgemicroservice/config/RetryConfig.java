package pl.lodz.p.it.socialfridgemicroservice.config;

import org.springframework.retry.annotation.EnableRetry;
import org.springframework.stereotype.Component;

@Component
@EnableRetry
public class RetryConfig {
}