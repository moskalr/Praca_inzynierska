package pl.lodz.p.it.socialfridgemicroservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SocialFridgeMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(SocialFridgeMicroserviceApplication.class, args);
	}

}
