package pl.lodz.p.it.socialfridgemicroservice.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @After("execution(* pl.lodz.p.it.socialfridgemicroservice.endpoints.*.*(..))")
    public void logAfter(JoinPoint joinPoint) {
        final String methodName = joinPoint.getSignature().getName();
        final String className = joinPoint.getTarget().getClass().getName();
        final Object[] args = joinPoint.getArgs();
        final String username = SecurityContextHolder.getContext().getAuthentication().getName();

        logger.info("User '{}' executed method {}.{} with arguments: {}", username, className, methodName, args);
    }
}
